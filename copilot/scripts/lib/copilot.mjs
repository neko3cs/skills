import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

import { binaryAvailable, runCommand } from "./process.mjs";

export const DEFAULT_CONTINUE_PROMPT = "Continue from where you left off.";
export const VALID_REASONING_EFFORTS = new Set(["none", "low", "medium", "high", "xhigh", "max"]);

const DEFAULT_TURN_TIMEOUT_MS = 30 * 60 * 1000;
// Windows CreateProcess caps the total command line around 32767 chars, and
// large review diffs routinely blow past that when passed inline via `-p`.
// Anything over this threshold is spilled to a temp file that Copilot reads
// with its own file tool instead.
const SAFE_INLINE_PROMPT_CHARS = 6000;

export function getCopilotAvailability(cwd) {
  return binaryAvailable("copilot", ["--version"], { cwd });
}

export async function getCopilotAuthStatus(cwd) {
  const envToken = process.env.COPILOT_GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (envToken) {
    return { loggedIn: true, detail: "Authenticated via an environment token (COPILOT_GITHUB_TOKEN/GH_TOKEN/GITHUB_TOKEN).", requiresAuth: true };
  }

  const ghStatus = runCommand("gh", ["auth", "status"], { cwd });
  if (!ghStatus.error && ghStatus.status === 0) {
    return {
      loggedIn: true,
      detail: "`gh auth status` reports an authenticated GitHub account. Copilot CLI keeps its own credential store, so this is a best-effort signal.",
      requiresAuth: true
    };
  }

  return {
    loggedIn: false,
    detail: "No environment token found and `gh auth status` did not confirm a GitHub login. Run `copilot login`, or set COPILOT_GITHUB_TOKEN/GH_TOKEN/GITHUB_TOKEN.",
    requiresAuth: true
  };
}

export function getSessionRuntimeStatus() {
  return { label: "per-call subprocess (no persistent daemon; each turn spawns `copilot -p`)" };
}

// The Copilot CLI has no session index we can query from outside a running
// session, so cross-session thread resumption relies entirely on job state
// tracked by this plugin (see resolveLatestTrackedTaskThread in the companion
// script). This always returns null; it exists to keep the call site parallel
// to a richer CLI that could support it later.
export function findLatestTaskThread() {
  return null;
}

export function buildPersistentTaskThreadName(prompt) {
  const normalized = String(prompt ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) {
    return `copilot-task-${Date.now().toString(36)}`;
  }
  return normalized.slice(0, 60);
}

export function readOutputSchema(schemaPath) {
  return fs.readFileSync(schemaPath, "utf8");
}

export function parseStructuredOutput(rawText, meta = {}) {
  const text = String(rawText ?? "").trim();
  if (!text) {
    return {
      parsed: null,
      rawOutput: "",
      parseError: meta.failureMessage || "Copilot did not return any output.",
      reasoningSummary: meta.reasoningSummary ?? []
    };
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = (fenced ? fenced[1] : text).trim();

  try {
    const parsed = JSON.parse(candidate);
    return { parsed, rawOutput: text, parseError: null, reasoningSummary: meta.reasoningSummary ?? [] };
  } catch (error) {
    return {
      parsed: null,
      rawOutput: text,
      parseError: error instanceof Error ? error.message : String(error),
      reasoningSummary: meta.reasoningSummary ?? []
    };
  }
}

// interruptCopilotTurn has no live RPC channel to cancel a specific turn (the
// Copilot CLI exposes no equivalent of Codex's app-server interrupt call for
// non-interactive `-p` runs). Cancellation always falls back to killing the
// job's process tree, handled by the companion script itself.
export async function interruptCopilotTurn() {
  return { attempted: false, interrupted: false, detail: null };
}

function writePromptSpillFile(prompt) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "copilot-companion-prompt-"));
  const filePath = path.join(dir, "prompt.md");
  fs.writeFileSync(filePath, prompt, "utf8");
  return filePath;
}

function resolveInlinePrompt(prompt) {
  if (prompt.length <= SAFE_INLINE_PROMPT_CHARS) {
    return { text: prompt, spillFile: null };
  }

  const spillFile = writePromptSpillFile(prompt);
  const text = [
    "Read the full task instructions from the local file below (UTF-8 text), then follow them exactly.",
    "Do not modify that file.",
    "",
    `Instructions file: ${spillFile}`
  ].join("\n");
  return { text, spillFile };
}

function buildTurnArgs({ prompt, resumeThreadId, threadName, model, effort, write, enableReasoningSummaries }) {
  const args = ["-p", prompt, "--output-format", "json", "--allow-all-tools", "--allow-all-paths", "--silent"];

  if (!write) {
    args.push("--deny-tool=write");
  }
  if (resumeThreadId) {
    args.push("--session-id", resumeThreadId);
  } else if (threadName) {
    args.push("--name", threadName);
  }
  if (model) {
    args.push("--model", model);
  }
  if (effort) {
    args.push("--effort", effort);
  }
  if (enableReasoningSummaries) {
    args.push("--enable-reasoning-summaries");
  }

  return args;
}

function extractReasoningText(event) {
  const data = event?.data ?? {};
  if (typeof data.summary === "string" && data.summary.trim()) {
    return data.summary.trim();
  }
  if (typeof data.content === "string" && data.content.trim()) {
    return data.content.trim();
  }
  if (typeof data.deltaContent === "string" && data.deltaContent.trim()) {
    return data.deltaContent.trim();
  }
  return null;
}

function deriveProgressMessage(event) {
  const type = String(event?.type ?? "");

  if (type === "session.tools_updated") {
    const model = event.data?.model;
    return { message: model ? `Session ready (model: ${model}).` : "Session ready.", phase: "starting" };
  }
  if (type === "user.message") {
    return { message: "Prompt sent.", phase: "starting" };
  }
  if (type === "assistant.turn_start") {
    return { message: "Turn started.", phase: "responding" };
  }
  if (type === "assistant.message_start") {
    return { message: "Copilot is responding.", phase: "responding" };
  }
  if (type === "assistant.turn_end") {
    return { message: "Turn completed.", phase: "finalizing" };
  }
  if (type === "result") {
    return { message: `Result received (exit ${event.exitCode ?? "?"}).`, phase: "done" };
  }
  if (type.includes("tool_call") || type.includes("tool_use") || type.includes("tool_result")) {
    return { message: `Running tool: ${type}.`, phase: "investigating" };
  }
  if (type.includes("reasoning")) {
    return null; // surfaced separately via reasoningSummary, not the phase log
  }
  if (type.startsWith("session.") || type.startsWith("assistant.")) {
    return null; // low-value bookkeeping events; skip to keep the log readable
  }
  return { message: `Event: ${type}.`, phase: null };
}

function runCopilotProcess(cwd, args, { onEvent, timeoutMs = DEFAULT_TURN_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    // Prompts may contain arbitrary user text (quotes, `&`, `|`, backticks).
    // shell:false + argv array avoids any shell reinterpretation on Windows.
    const child = spawn("copilot", args, {
      cwd,
      env: process.env,
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"]
    });

    const events = [];
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

    const rl = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }
      try {
        const event = JSON.parse(trimmed);
        events.push(event);
        onEvent?.(event);
      } catch {
        // Non-JSON stdout line; ignore rather than fail the whole turn.
      }
    });

    child.stderr.on("data", (chunk) => {
      stderrBuf += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: 1, events, stderr: stderrBuf, pid: child.pid ?? null, spawnError: error });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ status: code ?? 1, events, stderr: stderrBuf, pid: child.pid ?? null, spawnError: null });
    });
  });
}

export async function runCopilotTurn(workspaceRoot, options = {}) {
  const prompt = options.prompt || options.defaultPrompt || "";
  if (!prompt) {
    throw new Error("runCopilotTurn requires a prompt or defaultPrompt.");
  }

  const threadName = options.persistThread ? options.threadName ?? buildPersistentTaskThreadName(prompt) : null;
  const { text: inlinePrompt, spillFile } = resolveInlinePrompt(prompt);
  const args = buildTurnArgs({
    prompt: inlinePrompt,
    resumeThreadId: options.resumeThreadId ?? null,
    threadName,
    model: options.model ?? null,
    effort: options.effort ?? null,
    write: Boolean(options.write),
    enableReasoningSummaries: options.effort === "high" || options.effort === "xhigh" || options.effort === "max"
  });

  const reasoningSummary = [];
  const deltaBuffers = new Map();
  let sawFirstDelta = false;

  const execution = await runCopilotProcess(workspaceRoot, args, {
    onEvent: (event) => {
      if (String(event?.type ?? "").includes("reasoning")) {
        const text = extractReasoningText(event);
        if (text) {
          reasoningSummary.push(text);
        }
      }

      if (event?.type === "assistant.message_delta" && !sawFirstDelta) {
        sawFirstDelta = true;
        options.onProgress?.({ message: "Copilot is responding.", phase: "responding" });
      }

      const progress = deriveProgressMessage(event);
      if (progress) {
        options.onProgress?.(progress);
      }
    }
  });

  if (spillFile) {
    try {
      fs.rmSync(path.dirname(spillFile), { recursive: true, force: true });
    } catch {
      // Best-effort cleanup; leaving a stray temp file is not fatal.
    }
  }

  const resultEvent = execution.events.find((event) => event.type === "result") ?? null;
  const assistantMessages = execution.events.filter((event) => event.type === "assistant.message");
  const finalMessage = assistantMessages.length > 0 ? String(assistantMessages[assistantMessages.length - 1].data?.content ?? "") : "";

  const threadId = resultEvent?.sessionId ?? null;
  const touchedFiles = resultEvent?.usage?.codeChanges?.filesModified ?? [];

  let status = resultEvent?.exitCode ?? execution.status;
  let error = null;
  if (execution.spawnError) {
    status = 1;
    error = {
      message:
        execution.spawnError.code === "ENOENT"
          ? "The `copilot` command was not found. Install the GitHub Copilot CLI and rerun `/copilot:setup`."
          : execution.spawnError.message
    };
  } else if (status !== 0 && !finalMessage) {
    error = { message: execution.stderr.trim() || `copilot exited with status ${status}.` };
  }

  return {
    status,
    threadId,
    turnId: resultEvent?.data?.turnId ?? null,
    finalMessage,
    touchedFiles,
    reasoningSummary,
    stderr: execution.stderr,
    error,
    rawEvents: execution.events
  };
}
