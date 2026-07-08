import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { binaryAvailable, runCommand } from "./process.mjs";

export const DEFAULT_CONTINUE_PROMPT = "Continue from where you left off.";

const DEFAULT_TURN_TIMEOUT_MS = 20 * 60 * 1000;
// Same Windows CreateProcess command-line limit as the Copilot bridge; agy
// has no stdin fallback for -p either, so large prompts are spilled to a
// temp file and agy is told to read it (via --add-dir, since agy has no
// "allow all paths" flag).
const SAFE_INLINE_PROMPT_CHARS = 6000;

export function getAgyAvailability(cwd) {
  return binaryAvailable("agy", ["--version"], { cwd });
}

// agy has no `login`/`auth status` subcommand. `agy models` is a cheap,
// read-only, non-agentic call (no --dangerously-skip-permissions needed) that
// fails if the CLI cannot reach its backend, so it doubles as a best-effort
// readiness signal.
export async function getAgyAuthStatus(cwd) {
  const result = runCommand("agy", ["models"], { cwd });
  if (!result.error && result.status === 0 && result.stdout.trim()) {
    return { loggedIn: true, detail: "`agy models` returned a model list, so the CLI can reach its backend.", requiresAuth: true };
  }
  return {
    loggedIn: false,
    detail:
      "`agy models` did not return a model list. Run `agy` interactively once to complete sign-in, then rerun /agy:setup.",
    requiresAuth: true
  };
}

export function getSessionRuntimeStatus() {
  return { label: "per-call subprocess (no persistent daemon; each turn spawns `agy -p`)" };
}

// agy prints plain text, not a JSON event stream, so there is no reliable
// way to read back the conversation id it assigned. Cross-call resumption
// therefore always uses `--continue` (resume most recent on this machine)
// rather than an explicit id — see resolveLatestTrackedTaskThread in the
// companion script, which intentionally never needs a real thread id here.
export function findLatestTaskThread() {
  return null;
}

export function buildPersistentTaskThreadName(prompt) {
  const normalized = String(prompt ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return `agy-task-${Date.now().toString(36)}`;
  }
  return normalized.slice(0, 60);
}

// No live interrupt channel for a specific turn; cancellation always falls
// back to killing the job's process tree in the companion script.
export async function interruptAgyTurn() {
  return { attempted: false, interrupted: false, detail: null };
}

function writePromptSpillFile(prompt) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-companion-prompt-"));
  const filePath = path.join(dir, "prompt.md");
  fs.writeFileSync(filePath, prompt, "utf8");
  return { filePath, dir };
}

function resolveInlinePrompt(prompt) {
  if (prompt.length <= SAFE_INLINE_PROMPT_CHARS) {
    return { text: prompt, spillDir: null };
  }

  const { filePath, dir } = writePromptSpillFile(prompt);
  const text = [
    "Read the full task instructions from the local file below (UTF-8 text), then follow them exactly.",
    "Do not modify that file.",
    "",
    `Instructions file: ${filePath}`
  ].join("\n");
  return { text, spillDir: dir };
}

function buildTurnArgs({ prompt, resumeLast, model, write, spillDir }) {
  const args = ["-p", prompt, "--dangerously-skip-permissions"];

  if (resumeLast) {
    args.push("--continue");
  }
  if (model) {
    args.push("--model", model);
  }
  // Best-effort mapping: agy exposes no granular tool-permission flags like
  // Copilot's --deny-tool. --sandbox ("terminal restrictions") is the
  // closest available lever for a lower-trust, non-write-capable run.
  if (!write) {
    args.push("--sandbox");
  }
  if (spillDir) {
    args.push("--add-dir", spillDir);
  }

  return args;
}

function runAgyProcess(cwd, args, { timeoutMs = DEFAULT_TURN_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    // Prompts may contain arbitrary user text (quotes, `&`, `|`, backticks).
    // shell:false + argv array avoids any shell reinterpretation on Windows.
    const child = spawn("agy", args, {
      cwd,
      env: process.env,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdoutBuf = "";
    let stderrBuf = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      try {
        child.kill();
      } catch {
        // best-effort
      }
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdoutBuf += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      stderrBuf += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: 1, stdout: stdoutBuf, stderr: stderrBuf, pid: child.pid ?? null, spawnError: error });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: code ?? 1, stdout: stdoutBuf, stderr: stderrBuf, pid: child.pid ?? null, spawnError: null });
    });
  });
}

export async function runAgyTurn(workspaceRoot, options = {}) {
  const prompt = options.prompt || options.defaultPrompt || "";
  if (!prompt) {
    throw new Error("runAgyTurn requires a prompt or defaultPrompt.");
  }

  const { text: inlinePrompt, spillDir } = resolveInlinePrompt(prompt);
  const args = buildTurnArgs({
    prompt: inlinePrompt,
    resumeLast: Boolean(options.resumeLast),
    model: options.model ?? null,
    write: Boolean(options.write),
    spillDir
  });

  options.onProgress?.({ message: "agy is running (no streaming progress; plain-text output only).", phase: "responding" });

  const execution = await runAgyProcess(workspaceRoot, args);

  if (spillDir) {
    try {
      fs.rmSync(spillDir, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup; leaving a stray temp file is not fatal.
    }
  }

  const finalMessage = execution.stdout.trim();
  let status = execution.status;
  let error = null;
  if (execution.spawnError) {
    status = 1;
    error = {
      message:
        execution.spawnError.code === "ENOENT"
          ? "The `agy` command was not found. Install the Antigravity CLI and rerun `/agy:setup`."
          : execution.spawnError.message
    };
  } else if (status !== 0 && !finalMessage) {
    error = { message: execution.stderr.trim() || `agy exited with status ${status}.` };
  }

  return {
    status,
    threadId: null,
    turnId: null,
    finalMessage,
    touchedFiles: [],
    reasoningSummary: [],
    stderr: execution.stderr,
    error
  };
}
