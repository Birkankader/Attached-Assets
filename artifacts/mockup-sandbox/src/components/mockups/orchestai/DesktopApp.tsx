import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */

const DISCOVERED_AGENTS = [
  { id: "claude-opus", name: "Claude Opus 4", shortName: "Opus", cli: "claude", icon: "🟣", auth: true, version: "v1.2.3", model: "claude-opus-4-5", quota: 78 },
  { id: "claude-haiku", name: "Claude Haiku 3.5", shortName: "Haiku", cli: "claude", icon: "🟣", auth: true, version: "v1.2.3", model: "claude-haiku-3-5", quota: 91 },
  { id: "gemini", name: "Gemini 2.5 Pro", shortName: "Gemini", cli: "gemini", icon: "🔵", auth: true, version: "v0.9.1", model: "gemini-2.5-pro", quota: 55 },
  { id: "codex", name: "Codex CLI", shortName: "Codex", cli: "codex", icon: "⬛", auth: false, version: "v0.1.2504", model: null, quota: 0 },
  { id: "gpt4", name: "GPT-4.1", shortName: "GPT-4", cli: "openai", icon: "🟢", auth: false, version: null, model: null, quota: 0 },
];

const SESSIONS = [
  { id: "s1", name: "Task Manager App", status: "running", progress: 35, color: "#f59e0b" },
  { id: "s2", name: "Auth Microservice", status: "done", progress: 100, color: "#4ade80" },
];

const TASKS = [
  { id: "T1", title: "Setup project & monorepo", agent: "haiku", agentName: "Haiku", agentIcon: "🟣", status: "done", branch: "feat/setup", dur: "2m 14s", progress: 100, pr: "#11" },
  { id: "T2", title: "Database schema design", agent: "gemini-1", agentName: "Gemini #1", agentIcon: "🔵", status: "done", branch: "feat/db-schema", dur: "3m 02s", progress: 100, pr: "#12" },
  { id: "T3", title: "REST API endpoints", agent: "gemini-2", agentName: "Gemini #2", agentIcon: "🔵", status: "running", branch: "feat/api", dur: "1m 47s", progress: 68, pr: null },
  { id: "T4", title: "JWT authentication", agent: "haiku", agentName: "Haiku", agentIcon: "🟣", status: "running", branch: "feat/auth", dur: "2m 33s", progress: 41, pr: null },
  { id: "T5", title: "React frontend UI", agent: "gemini-1", agentName: "Gemini #1", agentIcon: "🔵", status: "queued", branch: "feat/frontend", dur: null, progress: 0, pr: null },
  { id: "T6", title: "Real-time WebSocket", agent: "gemini-2", agentName: "Gemini #2", agentIcon: "🔵", status: "queued", branch: "feat/realtime", dur: null, progress: 0, pr: null },
  { id: "T7", title: "Mobile responsive & PWA", agent: "haiku", agentName: "Haiku", agentIcon: "🟣", status: "queued", branch: "feat/mobile", dur: null, progress: 0, pr: null },
  { id: "T8", title: "E2E tests & CI pipeline", agent: "gemini-1", agentName: "Gemini #1", agentIcon: "🔵", status: "queued", branch: "feat/testing", dur: null, progress: 0, pr: null },
];

const TERMINAL_LOGS: Record<string, { t: string; type: "info" | "success" | "warn" | "cmd"; msg: string }[]> = {
  master: [
    { t: "14:32:01", type: "cmd", msg: "> claude --model claude-opus-4-5 orchestrate" },
    { t: "14:32:03", type: "info", msg: "Analyzing task requirements..." },
    { t: "14:32:05", type: "success", msg: "Decomposed into 8 subtasks" },
    { t: "14:32:07", type: "success", msg: "Workers assigned. Starting execution." },
    { t: "14:36:08", type: "success", msg: "T1 review passed ✓" },
    { t: "14:36:17", type: "success", msg: "T2 review passed ✓" },
    { t: "14:36:22", type: "info", msg: "Monitoring T3, T4..." },
  ],
  "gemini-2": [
    { t: "14:33:00", type: "cmd", msg: "> gemini start --worktree feat/api" },
    { t: "14:33:05", type: "info", msg: "Worktree created: feat/api" },
    { t: "14:34:22", type: "info", msg: "Creating routes/tasks.ts..." },
    { t: "14:35:45", type: "info", msg: "POST /tasks implemented" },
    { t: "14:36:47", type: "warn", msg: "⚠ Rate limit: throttling requests" },
    { t: "14:37:01", type: "info", msg: "PUT /tasks/:id..." },
  ],
  haiku: [
    { t: "14:33:00", type: "cmd", msg: "> claude --model haiku-3-5 start --worktree feat/auth" },
    { t: "14:33:10", type: "info", msg: "Worktree: feat/auth" },
    { t: "14:34:10", type: "info", msg: "Building /auth/register..." },
    { t: "14:35:20", type: "info", msg: "Building /auth/login..." },
    { t: "14:36:00", type: "info", msg: "Token refresh logic..." },
  ],
  "gemini-1": [
    { t: "14:32:10", type: "cmd", msg: "> gemini start --worktree feat/setup" },
    { t: "14:32:30", type: "info", msg: "pnpm workspace initialized" },
    { t: "14:33:20", type: "info", msg: "tsconfig.json files created" },
    { t: "14:33:58", type: "success", msg: "Task T1 complete ✓" },
    { t: "14:34:01", type: "success", msg: "PR #11 opened" },
    { t: "14:34:12", type: "success", msg: "Merged to main ✓" },
    { t: "14:34:15", type: "info", msg: "Waiting for next assignment..." },
  ],
};

/* ═══════════════════════════════════════════════════════════
   TOKENS & UTILS
═══════════════════════════════════════════════════════════ */

const C = {
  bg: "#09090f",
  sidebar: "#0c0c14",
  panel: "#0f0f1a",
  surface: "#13131f",
  surfaceHover: "#191926",
  border: "#1c1c2e",
  borderStrong: "#252538",
  accent: "#6366f1",
  accentSoft: "#1e1b4b",
  accentText: "#a5b4fc",
  textPrimary: "#e2e8f0",
  textSecondary: "#8b8fa8",
  textMuted: "#4b4d66",
  green: "#4ade80",
  greenBg: "#052e16",
  greenBorder: "#14532d",
  amber: "#f59e0b",
  amberBg: "#1c1000",
  amberBorder: "#78350f",
  red: "#f87171",
  redBg: "#1f0000",
};

const STATUS: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  done:    { dot: C.green, label: "Done",       bg: C.greenBg, text: C.green },
  running: { dot: C.amber, label: "In Progress", bg: C.amberBg, text: C.amber },
  queued:  { dot: C.textMuted, label: "Queued", bg: "#0f0f1a",  text: C.textSecondary },
  review:  { dot: C.accentText, label: "Review", bg: C.accentSoft, text: C.accentText },
};

const LOG_COLOR: Record<string, string> = {
  info: C.textSecondary, success: C.green, warn: C.amber, cmd: C.accentText,
};

/* ═══════════════════════════════════════════════════════════
   SUBCOMPONENTS
═══════════════════════════════════════════════════════════ */

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none"
          style={{ background: "#1e1e30", color: C.textPrimary, border: `1px solid ${C.borderStrong}`, boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: "#1e1e30" }} />
        </div>
      )}
    </div>
  );
}

function StatusDot({ status, pulse }: { status: string; pulse?: boolean }) {
  return (
    <span className="relative inline-flex">
      <span className="w-2 h-2 rounded-full block" style={{ background: STATUS[status]?.dot ?? C.textMuted }} />
      {pulse && status === "running" && (
        <span className="absolute inset-0 rounded-full animate-ping" style={{ background: STATUS[status]?.dot, opacity: 0.4 }} />
      )}
    </span>
  );
}

function Pill({ status }: { status: string }) {
  const s = STATUS[status];
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s?.bg, color: s?.text }}>
      {s?.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════ */

function Sidebar({ activeSession, setActiveSession, view, setView, onNewSession }:
  { activeSession: string; setActiveSession: (s: string) => void; view: string; setView: (v: string) => void; onNewSession: () => void }) {
  return (
    <div className="flex flex-col items-center py-3 gap-1 border-r flex-shrink-0" style={{ width: 56, background: C.sidebar, borderColor: C.border }}>
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 cursor-pointer"
        style={{ background: "linear-gradient(135deg, #5b5ef4, #7c3aed)" }}>
        <span className="text-white font-bold text-sm">♦</span>
      </div>

      <div className="w-full px-1.5 space-y-1">
        {/* Sessions */}
        {SESSIONS.map(s => (
          <Tooltip key={s.id} label={s.name}>
            <button onClick={() => { setActiveSession(s.id); setView("kanban"); }}
              className="w-full aspect-square rounded-xl flex items-center justify-center relative transition-all"
              style={{ background: activeSession === s.id ? C.accentSoft : "transparent", border: activeSession === s.id ? `1px solid ${C.accent}` : "1px solid transparent" }}>
              <span className="text-sm font-bold" style={{ color: activeSession === s.id ? C.accentText : C.textSecondary }}>
                {s.name.charAt(0)}
              </span>
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full border" style={{ background: s.color, borderColor: C.sidebar }} />
            </button>
          </Tooltip>
        ))}

        {/* New session */}
        <Tooltip label="New Orchestration">
          <button onClick={onNewSession}
            className="w-full aspect-square rounded-xl flex items-center justify-center transition-all"
            style={{ border: `1px dashed ${C.borderStrong}`, color: C.textMuted }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.accent; (e.currentTarget as HTMLElement).style.color = C.accentText; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderStrong; (e.currentTarget as HTMLElement).style.color = C.textMuted; }}>
            <span className="text-lg leading-none">+</span>
          </button>
        </Tooltip>
      </div>

      <div className="flex-1" />

      {/* Bottom icons */}
      <div className="w-full px-1.5 space-y-1 pb-1">
        {[
          { icon: "◎", label: "Usage & Quotas", v: "usage" },
          { icon: "⚙", label: "Settings", v: "settings" },
        ].map(item => (
          <Tooltip key={item.v} label={item.label}>
            <button onClick={() => setView(item.v)}
              className="w-full aspect-square rounded-xl flex items-center justify-center text-sm transition-all"
              style={{ background: view === item.v ? C.accentSoft : "transparent", color: view === item.v ? C.accentText : C.textMuted }}>
              {item.icon}
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SETUP PANEL (modal-like, slides in from right)
═══════════════════════════════════════════════════════════ */

function SetupPanel({ onClose, onLaunch }: { onClose: () => void; onLaunch: () => void }) {
  const [step, setStep] = useState(0);
  const [master, setMaster] = useState("claude-opus");
  const [workers, setWorkers] = useState<Record<string, number>>({ gemini: 2, "claude-haiku": 1 });
  const [task, setTask] = useState("");
  const [name, setName] = useState("New Orchestration");

  const toggleWorker = (id: string) => {
    if (!DISCOVERED_AGENTS.find(a => a.id === id)?.auth) return;
    setWorkers(prev => {
      if (prev[id]) { const n = { ...prev }; delete n[id]; return n; }
      return { ...prev, [id]: 1 };
    });
  };
  const changeCount = (id: string, d: number) =>
    setWorkers(prev => ({ ...prev, [id]: Math.max(1, Math.min(5, (prev[id] || 1) + d)) }));

  const totalWorkers = Object.values(workers).reduce((a, b) => a + b, 0);

  return (
    <div className="absolute inset-0 z-40 flex" style={{ background: "rgba(5,5,12,0.75)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ml-auto h-full flex flex-col" style={{ width: 560, background: C.panel, borderLeft: `1px solid ${C.borderStrong}`, boxShadow: "-8px 0 40px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>New Orchestration</h2>
            <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
              {step === 0 ? "Name your session" : step === 1 ? "Select agents" : "Describe the task"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: C.surface, color: C.textMuted }}>×</button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: C.border }}>
          {["Session", "Agents", "Task"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => i < step && setStep(i)}
                className="flex items-center gap-1.5 text-xs transition-all"
                style={{ color: i === step ? C.accentText : i < step ? C.green : C.textMuted }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: i < step ? C.greenBg : i === step ? C.accentSoft : C.surface, color: i < step ? C.green : i === step ? C.accentText : C.textMuted, border: `1px solid ${i < step ? C.greenBorder : i === step ? C.accent : C.borderStrong}` }}>
                  {i < step ? "✓" : i + 1}
                </span>
                {s}
              </button>
              {i < 2 && <span style={{ color: C.textMuted, fontSize: 10 }}>›</span>}
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5">
            {/* Step 0: Name */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.accentText }}>Session Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Task Manager App, Auth Service..."
                    className="w-full rounded-xl px-4 py-3 text-sm"
                    style={{ background: C.surface, border: `1px solid ${C.borderStrong}`, color: C.textPrimary, outline: "none" }} />
                </div>
                <div className="rounded-xl p-4 border" style={{ background: C.surface, borderColor: C.border }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: C.textSecondary }}>Settings</div>
                  {[
                    { label: "Developer Mode", sub: "Access agent terminals directly", val: false },
                    { label: "Auto Merge", sub: "Merge PRs automatically after review", val: false },
                    { label: "Auto PR", sub: "Open PRs when tasks complete", val: true },
                    { label: "Code Review Gate", sub: "Require review before merging", val: true },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
                      <div>
                        <div className="text-sm" style={{ color: C.textPrimary }}>{s.label}</div>
                        <div className="text-xs" style={{ color: C.textMuted }}>{s.sub}</div>
                      </div>
                      <div className="w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer" style={{ background: s.val ? C.accent : C.borderStrong }}>
                        <div className="w-4 h-4 rounded-full bg-white" style={{ marginLeft: s.val ? "auto" : "0" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Agents */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.accentText }}>Conductor (Master Agent)</div>
                {DISCOVERED_AGENTS.filter(a => a.auth).map(ag => (
                  <div key={ag.id} onClick={() => setMaster(ag.id)}
                    className="rounded-xl p-3.5 border cursor-pointer transition-all flex items-center gap-3"
                    style={{ background: master === ag.id ? "#151528" : C.surface, borderColor: master === ag.id ? C.accent : C.borderStrong }}>
                    <span className="text-xl">{ag.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: C.textPrimary }}>{ag.name}</div>
                      <div className="text-xs" style={{ color: C.textMuted }}>{ag.model} · {ag.version}</div>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: master === ag.id ? C.accent : C.borderStrong }}>
                      {master === ag.id && <div className="w-2 h-2 rounded-full" style={{ background: C.accent }} />}
                    </div>
                  </div>
                ))}

                <div className="text-xs font-semibold uppercase tracking-wider mt-5 mb-3 pt-2" style={{ color: C.accentText }}>Workers</div>
                {DISCOVERED_AGENTS.map(ag => (
                  <div key={ag.id} className="rounded-xl p-3.5 border flex items-center gap-3"
                    style={{ background: C.surface, borderColor: workers[ag.id] ? C.borderStrong : C.border, opacity: !ag.auth ? 0.5 : 1 }}>
                    <span className="text-xl">{ag.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: C.textPrimary }}>{ag.name}</div>
                      {ag.auth
                        ? <div className="text-xs" style={{ color: C.textMuted }}>{ag.model}</div>
                        : <div className="text-xs" style={{ color: C.amber }}>⚠ Login required</div>}
                    </div>
                    {ag.auth ? (
                      workers[ag.id] ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeCount(ag.id, -1)} className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ background: C.borderStrong, color: C.textSecondary }}>−</button>
                          <span className="w-7 text-center text-sm font-bold" style={{ color: C.textPrimary }}>×{workers[ag.id]}</span>
                          <button onClick={() => changeCount(ag.id, 1)} className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ background: C.borderStrong, color: C.textSecondary }}>+</button>
                          <button onClick={() => toggleWorker(ag.id)} className="ml-1 text-xs" style={{ color: C.textMuted }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => toggleWorker(ag.id)} className="text-xs px-3 py-1.5 rounded-lg"
                          style={{ background: C.accentSoft, color: C.accentText, border: `1px solid ${C.accent}40` }}>
                          + Add
                        </button>
                      )
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#1a0800", color: C.amber }}>Login</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Task */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: C.accentText }}>Task Description</label>
                  <textarea value={task} onChange={e => setTask(e.target.value)} rows={6}
                    placeholder="Describe what you want to build. Be as specific as possible — the master agent will decompose this into subtasks for your workers."
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none leading-relaxed"
                    style={{ background: C.surface, border: `1px solid ${C.borderStrong}`, color: C.textPrimary, outline: "none" }} />
                  <div className="text-xs mt-1.5" style={{ color: C.textMuted }}>{task.length} chars</div>
                </div>

                {/* Summary card */}
                <div className="rounded-xl p-4 border" style={{ background: "#0e0e1e", borderColor: C.borderStrong }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: C.textSecondary }}>Orchestra Summary</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">🟣</span>
                    <div>
                      <div className="text-xs font-medium" style={{ color: C.textPrimary }}>{DISCOVERED_AGENTS.find(a => a.id === master)?.name}</div>
                      <div className="text-xs" style={{ color: C.textMuted }}>Conductor</div>
                    </div>
                  </div>
                  <div className="ml-1 pl-3 border-l space-y-1.5" style={{ borderColor: C.borderStrong }}>
                    {Object.entries(workers).map(([id, count]) => {
                      const ag = DISCOVERED_AGENTS.find(a => a.id === id)!;
                      return (
                        <div key={id} className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                          <span>{ag.icon}</span>
                          <span>{ag.name} <span style={{ color: C.textMuted }}>×{count}</span></span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: C.border, color: C.textMuted }}>
                    {totalWorkers} workers · {Object.keys(workers).length} agent types · {totalWorkers} worktrees
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: C.border }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: C.surface, color: C.textSecondary, border: `1px solid ${C.borderStrong}` }}>
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: C.accent, color: "#fff" }}>
              Continue →
            </button>
          ) : (
            <button onClick={onLaunch}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #5b5ef4, #7c3aed)", color: "#fff" }}>
              ▶ Launch Orchestra
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   KANBAN VIEW
═══════════════════════════════════════════════════════════ */

function KanbanView({ selectedTask, setSelectedTask }: { selectedTask: string | null; setSelectedTask: (id: string) => void }) {
  const cols = [
    { key: "queued",  label: "Queued",      count: TASKS.filter(t => t.status === "queued").length },
    { key: "running", label: "In Progress", count: TASKS.filter(t => t.status === "running").length },
    { key: "done",    label: "Done",        count: TASKS.filter(t => t.status === "done").length },
  ];

  return (
    <div className="flex h-full gap-4 p-5 overflow-x-auto">
      {cols.map(col => (
        <div key={col.key} className="flex-shrink-0" style={{ width: 248 }}>
          <div className="flex items-center gap-2 mb-3 px-1">
            <StatusDot status={col.key} />
            <span className="text-xs font-semibold" style={{ color: C.textSecondary }}>{col.label}</span>
            <span className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: C.surface, color: C.textMuted }}>{col.count}</span>
          </div>
          <div className="space-y-2">
            {TASKS.filter(t => t.status === col.key).map(task => (
              <div key={task.id} onClick={() => setSelectedTask(task.id)}
                className="rounded-2xl p-3.5 border cursor-pointer transition-all group"
                style={{ background: selectedTask === task.id ? "#14142a" : C.surface, borderColor: selectedTask === task.id ? C.accent : C.border }}
                onMouseEnter={e => { if (selectedTask !== task.id) (e.currentTarget as HTMLElement).style.borderColor = C.borderStrong; }}
                onMouseLeave={e => { if (selectedTask !== task.id) (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>

                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-xs font-mono font-bold" style={{ color: C.textMuted }}>{task.id}</span>
                  {task.pr && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded-md" style={{ background: C.accentSoft, color: C.accentText }}>{task.pr}</span>
                  )}
                </div>

                <div className="text-sm leading-snug mb-3 font-medium" style={{ color: C.textPrimary }}>{task.title}</div>

                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-xs">{task.agentIcon}</span>
                  <span className="text-xs" style={{ color: C.textSecondary }}>{task.agentName}</span>
                </div>

                {task.status === "running" && (
                  <div className="mb-2.5">
                    <div className="flex justify-between text-xs mb-1" style={{ color: C.textMuted }}>
                      <span>Progress</span><span style={{ color: C.amber }}>{task.progress}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: C.borderStrong }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${task.progress}%`, background: C.amber }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono truncate" style={{ color: C.textMuted, maxWidth: 140 }}>{task.branch}</span>
                  {task.dur && <span className="text-xs" style={{ color: C.textMuted }}>{task.dur}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TERMINAL VIEW
═══════════════════════════════════════════════════════════ */

const TERM_AGENTS = [
  { id: "master",   name: "Claude Opus 4",   role: "CONDUCTOR", icon: "🟣", status: "orchestrating" },
  { id: "gemini-2", name: "Gemini #2",        role: "WORKER",    icon: "🔵", status: "running" },
  { id: "haiku",    name: "Haiku",            role: "WORKER",    icon: "🟣", status: "running" },
  { id: "gemini-1", name: "Gemini #1",        role: "WORKER",    icon: "🔵", status: "idle" },
];

function TerminalView({ devMode }: { devMode: boolean }) {
  const [selAgent, setSelAgent] = useState("gemini-2");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const agent = TERM_AGENTS.find(a => a.id === selAgent)!;
  const logs = TERMINAL_LOGS[selAgent] ?? [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Agent tabs */}
      <div className="w-44 flex-shrink-0 border-r flex flex-col" style={{ borderColor: C.border, background: C.sidebar }}>
        <div className="px-3 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: C.accentText }}>Agents</div>
        <div className="flex-1 px-2 space-y-1 pb-3">
          {TERM_AGENTS.map(a => (
            <button key={a.id} onClick={() => setSelAgent(a.id)}
              className="w-full rounded-xl px-3 py-2.5 text-left border transition-all"
              style={{ background: selAgent === a.id ? "#141428" : "transparent", borderColor: selAgent === a.id ? C.accent : "transparent" }}>
              <div className="flex items-center gap-2">
                <span className="text-sm">{a.icon}</span>
                <span className="text-xs font-medium truncate" style={{ color: selAgent === a.id ? C.textPrimary : C.textSecondary }}>{a.name}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 ml-5">
                <StatusDot status={a.status === "idle" ? "queued" : a.status === "orchestrating" ? "running" : a.status} />
                <span className="text-xs" style={{ color: C.textMuted }}>{a.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b flex-shrink-0" style={{ borderColor: C.border }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <span className="text-xs font-mono" style={{ color: C.textSecondary }}>{agent.name} — {agent.role} — <span style={{ color: C.accentText }}>worktree/{(TASKS.find(t => t.agent === selAgent) || TASKS[0]).branch}</span></span>
        </div>

        <ScrollArea className="flex-1" style={{ background: "#050508" }}>
          <div className="p-5 space-y-1.5 font-mono text-xs">
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 select-none" style={{ color: "#2d2d50" }}>{l.t}</span>
                <span className="flex-1" style={{ color: LOG_COLOR[l.type] }}>{l.msg}</span>
              </div>
            ))}
            {agent.status === "running" && (
              <div className="flex gap-3">
                <span style={{ color: "#2d2d50" }}>14:37:12</span>
                <span style={{ color: C.amber }}>█</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {devMode && (
          <div className="border-t px-4 py-3 flex-shrink-0" style={{ borderColor: C.border, background: "#08080f" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: C.accentSoft, color: C.accentText }}>DEV MODE</span>
              <span className="text-xs" style={{ color: C.textMuted }}>Inject prompt → {agent.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-mono self-center" style={{ color: C.accentText }}>›</span>
              <input value={inputs[selAgent] ?? ""} onChange={e => setInputs(p => ({ ...p, [selAgent]: e.target.value }))}
                placeholder="Type instruction or question..."
                className="flex-1 bg-transparent text-xs font-mono outline-none"
                style={{ color: C.textPrimary, caretColor: C.accentText }} />
              <button className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: inputs[selAgent] ? C.accent : C.surface, color: inputs[selAgent] ? "#fff" : C.textMuted }}>
                Send ↵
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CODE REVIEW VIEW
═══════════════════════════════════════════════════════════ */

function CodeReviewView({ onDone }: { onDone: () => void }) {
  const [comment, setComment] = useState("");
  const [accepted, setAccepted] = useState(false);
  const files = [
    { f: "src/routes/tasks.ts",         ok: true,  note: "Clean RESTful design. Proper error handling." },
    { f: "src/auth/middleware.ts",       ok: true,  note: "JWT validation correct. Token expiry handled." },
    { f: "src/schema/users.ts",          ok: false, note: "Add index on users.email for query performance." },
    { f: "client/src/App.tsx",           ok: true,  note: "Solid component structure. Consider lazy routes." },
    { f: "client/src/hooks/useTasks.ts", ok: true,  note: "React Query usage is correct." },
    { f: "docker-compose.yml",           ok: false, note: "Restrict port exposure in production." },
  ];

  return (
    <div className="h-full overflow-y-auto px-8 py-7">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1e1b4b, #3730a3)" }}>🟣</div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: C.accentText }}>Master Agent Review</div>
            <h2 className="text-lg font-bold" style={{ color: C.textPrimary }}>Code review complete — 2 suggestions</h2>
            <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>All 8 tasks reviewed by Claude Opus 4. Ready to merge.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[{ v: "8/8", l: "Tasks Done", c: C.green }, { v: "8 PRs", l: "Ready to Merge", c: C.accentText }, { v: "2 minor", l: "Suggestions", c: C.amber }].map(s => (
            <div key={s.l} className="rounded-2xl p-4 border text-center" style={{ background: C.surface, borderColor: C.borderStrong }}>
              <div className="text-xl font-bold mb-0.5" style={{ color: s.c }}>{s.v}</div>
              <div className="text-xs" style={{ color: C.textSecondary }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* File review */}
        <div className="rounded-2xl border overflow-hidden mb-5" style={{ borderColor: C.borderStrong }}>
          <div className="px-4 py-3 border-b" style={{ background: C.surface, borderColor: C.border }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>File Review</span>
          </div>
          {files.map((f, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 border-b last:border-0 text-xs"
              style={{ borderColor: C.border, background: i % 2 === 0 ? C.panel : C.bg }}>
              <span className="mt-0.5 flex-shrink-0">{f.ok ? "✅" : "⚠️"}</span>
              <span className="font-mono w-44 flex-shrink-0 truncate" style={{ color: C.accentText }}>{f.f}</span>
              <span style={{ color: C.textSecondary }}>{f.note}</span>
            </div>
          ))}
        </div>

        {/* Master summary */}
        <div className="rounded-2xl p-4 border mb-5" style={{ background: "#0b0b1e", borderColor: C.borderStrong }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.accentText }}>Summary</div>
          <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
            Well-structured codebase. Auth is secure, APIs are RESTful, frontend is clean. Two minor improvements recommended before merge: index on <code className="px-1 rounded" style={{ background: C.surface, color: C.accentText }}>users.email</code> and restricted Docker ports in production. No blocking issues.
          </p>
        </div>

        {/* User input */}
        {!accepted ? (
          <div className="rounded-2xl p-4 border mb-5" style={{ background: C.surface, borderColor: C.borderStrong }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.accentText }}>Your Response (optional)</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Leave a comment, or skip to accept as-is..."
              className="w-full rounded-xl px-3 py-2.5 text-sm resize-none"
              style={{ background: C.panel, border: `1px solid ${C.borderStrong}`, color: C.textPrimary, outline: "none" }} />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setAccepted(true)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.green, color: "#000" }}>
                ✓ Accept & Merge All
              </button>
              <button onClick={onDone} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: C.surface, color: C.textSecondary, border: `1px solid ${C.borderStrong}` }}>
                Skip → Accept as-is
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 border mb-5" style={{ background: C.greenBg, borderColor: C.greenBorder }}>
            <div className="text-sm font-semibold" style={{ color: C.green }}>✓ Review accepted — merging all PRs…</div>
            <div className="text-xs mt-1" style={{ color: "#166534" }}>Master agent is merging 8 branches to main.</div>
          </div>
        )}

        <button onClick={onDone} className="w-full py-3 rounded-2xl text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #5b5ef4, #7c3aed)", color: "#fff" }}>
          View Final Summary →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DONE VIEW
═══════════════════════════════════════════════════════════ */

function DoneView({ onNew }: { onNew: () => void }) {
  return (
    <div className="h-full overflow-y-auto px-8 py-10">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ background: C.greenBg, border: `2px solid ${C.greenBorder}` }}>✓</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: C.green }}>Orchestration Complete</h1>
        <p className="text-sm mb-8" style={{ color: C.textSecondary }}>All 8 tasks completed, reviewed, and merged to main.</p>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[{ l: "Tasks", v: "8/8" }, { l: "PRs Merged", v: "8" }, { l: "Total Time", v: "33m" }, { l: "Agents", v: "4" }].map(s => (
            <div key={s.l} className="rounded-2xl p-4 border" style={{ background: C.surface, borderColor: C.borderStrong }}>
              <div className="text-xl font-bold" style={{ color: C.green }}>{s.v}</div>
              <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border overflow-hidden mb-8 text-left" style={{ borderColor: C.greenBorder }}>
          <div className="px-4 py-3 border-b" style={{ background: "#071a0e", borderColor: C.greenBorder }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.green }}>Merged PRs</span>
          </div>
          {TASKS.map((t, i) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-xs"
              style={{ borderColor: "#0d3321", background: i % 2 === 0 ? "#071a0e" : "#052e16" }}>
              <span className="font-mono font-bold w-8" style={{ color: C.green }}>#{11 + i}</span>
              <span className="font-mono flex-1" style={{ color: "#6ee7b7" }}>{t.branch}</span>
              <span style={{ color: C.textMuted }}>{t.agentName}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onNew} className="flex-1 py-3 rounded-2xl text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #5b5ef4, #7c3aed)", color: "#fff" }}>
            ♦ New Orchestration
          </button>
          <button className="px-5 py-3 rounded-2xl text-sm font-medium"
            style={{ background: C.surface, color: C.textSecondary, border: `1px solid ${C.borderStrong}` }}>
            GitHub →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TASK DETAIL PANEL
═══════════════════════════════════════════════════════════ */

function TaskDetail({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = TASKS.find(t => t.id === taskId);
  if (!task) return null;

  return (
    <div className="flex flex-col border-l flex-shrink-0" style={{ width: 272, borderColor: C.border, background: C.panel }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: C.border }}>
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.accentText }}>Task Detail</div>
        <button onClick={onClose} className="w-6 h-6 rounded-md flex items-center justify-center text-sm" style={{ color: C.textMuted }}>×</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2"><Pill status={task.status} /></div>
          <div className="text-sm font-semibold leading-snug" style={{ color: C.textPrimary }}>{task.title}</div>
          <div className="text-xs font-mono mt-1.5" style={{ color: C.textMuted }}>{task.id}</div>
        </div>

        <div className="rounded-xl p-3 border" style={{ background: C.surface, borderColor: C.border }}>
          <div className="text-xs font-semibold mb-2.5" style={{ color: C.textSecondary }}>Assigned Agent</div>
          <div className="flex items-center gap-2">
            <span className="text-base">{task.agentIcon}</span>
            <div>
              <div className="text-sm font-medium" style={{ color: C.textPrimary }}>{task.agentName}</div>
              <div className="text-xs" style={{ color: C.textMuted }}>Active · worktree ready</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>Branch</div>
          <div className="rounded-lg px-3 py-2 text-xs font-mono" style={{ background: C.surface, color: C.accentText, border: `1px solid ${C.border}` }}>{task.branch}</div>
        </div>

        {task.status === "running" && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: C.textSecondary }}>Progress</span>
              <span style={{ color: C.amber }}>{task.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.borderStrong }}>
              <div className="h-full rounded-full" style={{ width: `${task.progress}%`, background: C.amber }} />
            </div>
            <div className="text-xs mt-1.5" style={{ color: C.textMuted }}>Running for {task.dur}</div>
          </div>
        )}

        {task.status === "done" && (
          <div className="rounded-xl p-3 border" style={{ background: C.greenBg, borderColor: C.greenBorder }}>
            <div className="text-xs font-medium mb-1" style={{ color: C.green }}>✓ Awaiting Merge</div>
            {task.pr && <div className="text-xs font-mono" style={{ color: "#166534" }}>PR {task.pr} opened · Review passed</div>}
            <button className="w-full mt-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.greenBorder, color: C.green }}>Merge PR →</button>
          </div>
        )}

        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>Reassign To</div>
          <select className="w-full rounded-lg px-3 py-2 text-xs" style={{ background: C.surface, color: C.textSecondary, border: `1px solid ${C.borderStrong}`, outline: "none" }}>
            <option>Claude Haiku 3.5</option>
            <option>Gemini 2.5 Pro #1</option>
            <option>Gemini 2.5 Pro #2</option>
            <option>Claude Opus 4 (master)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   USAGE VIEW
═══════════════════════════════════════════════════════════ */

function UsageView() {
  return (
    <div className="h-full overflow-y-auto px-7 py-7">
      <div className="max-w-lg">
        <h2 className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>Usage & Quotas</h2>
        <p className="text-xs mb-6" style={{ color: C.textSecondary }}>Token consumption per agent, updated in real time.</p>
        <div className="space-y-3">
          {DISCOVERED_AGENTS.filter(a => a.auth).map(ag => (
            <div key={ag.id} className="rounded-2xl p-4 border" style={{ background: C.surface, borderColor: C.borderStrong }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{ag.icon}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: C.textPrimary }}>{ag.name}</div>
                    <div className="text-xs" style={{ color: C.textMuted }}>{ag.model}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: ag.quota > 50 ? C.green : ag.quota > 25 ? C.amber : C.red }}>{ag.quota}%</div>
                  <div className="text-xs" style={{ color: C.textMuted }}>remaining</div>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: C.borderStrong }}>
                <div className="h-full rounded-full" style={{ width: `${100 - ag.quota}%`, background: ag.quota > 50 ? C.green : ag.quota > 25 ? C.amber : C.red, opacity: 0.8 }} />
              </div>
              <div className="flex justify-between text-xs" style={{ color: C.textMuted }}>
                <span>Used: {((18 * (100 - ag.quota)) / 100).toFixed(1)}M tokens</span>
                <span>Daily limit: 18M tokens</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */

type View = "kanban" | "terminal" | "review" | "done" | "usage" | "settings";

export function DesktopApp() {
  const [view, setView] = useState<View>("kanban");
  const [activeSession, setActiveSession] = useState("s1");
  const [showSetup, setShowSetup] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showReviewBanner, setShowReviewBanner] = useState(false);

  const session = SESSIONS.find(s => s.id === activeSession)!;
  const doneTasks = TASKS.filter(t => t.status === "done").length;
  const totalTasks = TASKS.length;

  const tabs: { key: View; label: string; icon: string }[] = [
    { key: "kanban",   label: "Board",    icon: "⊞" },
    { key: "terminal", label: "Terminal", icon: "⌨" },
    { key: "usage",    label: "Usage",    icon: "◎" },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: C.bg, color: C.textPrimary, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Main shell ── */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeSession={activeSession}
          setActiveSession={id => { setActiveSession(id); setView("kanban"); setSelectedTask(null); }}
          view={view}
          setView={v => setView(v as View)}
          onNewSession={() => setShowSetup(true)}
        />

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Content header */}
          <div className="flex items-center gap-0 border-b flex-shrink-0 pl-1 pr-4"
            style={{ borderColor: C.border, background: C.panel, height: 44 }}>

            {/* Session name + status */}
            <div className="flex items-center gap-2.5 px-4 border-r mr-2" style={{ borderColor: C.border, minWidth: 180 }}>
              <StatusDot status={session.status} pulse />
              <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>{session.name}</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center h-full">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setView(tab.key)}
                  className="flex items-center gap-1.5 h-full px-4 text-xs font-medium border-b-2 transition-colors"
                  style={{ borderColor: view === tab.key ? C.accent : "transparent", color: view === tab.key ? C.accentText : C.textMuted }}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Review banner trigger (simulated notification) */}
            {view !== "review" && view !== "done" && (
              <button onClick={() => setShowReviewBanner(v => !v)}
                className="relative mr-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{ background: showReviewBanner ? C.accentSoft : "transparent", color: showReviewBanner ? C.accentText : C.textMuted }}>
                🔔
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: C.amber }} />
              </button>
            )}

            {/* Dev mode toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: C.textMuted }}>Dev</span>
              <button onClick={() => setDevMode(v => !v)}
                className="w-8 h-4 rounded-full flex items-center px-0.5 transition-all flex-shrink-0"
                style={{ background: devMode ? C.accent : C.borderStrong }}>
                <div className="w-3 h-3 rounded-full bg-white transition-all" style={{ marginLeft: devMode ? "auto" : "0" }} />
              </button>
            </div>
          </div>

          {/* Notification banner */}
          {showReviewBanner && view !== "review" && view !== "done" && (
            <div className="flex items-center gap-3 px-5 py-2.5 border-b flex-shrink-0"
              style={{ background: "#0e0e20", borderColor: C.accent + "50" }}>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: C.accentSoft, color: C.accentText }}>NEW</span>
              <span className="text-xs flex-1" style={{ color: C.textSecondary }}>🟣 Master agent has completed code review on 2 tasks. Ready for your approval.</span>
              <button onClick={() => { setView("review"); setShowReviewBanner(false); }}
                className="text-xs px-3 py-1 rounded-lg font-medium"
                style={{ background: C.accentSoft, color: C.accentText, border: `1px solid ${C.accent}50` }}>
                Open Review
              </button>
              <button onClick={() => setShowReviewBanner(false)} style={{ color: C.textMuted, fontSize: 12 }}>×</button>
            </div>
          )}

          {/* Progress strip */}
          {view === "kanban" && (
            <div className="flex items-center gap-3 px-5 py-2 border-b flex-shrink-0 text-xs" style={{ borderColor: C.border, background: C.bg }}>
              <span style={{ color: C.textMuted }}>{doneTasks}/{totalTasks} tasks</span>
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.borderStrong, maxWidth: 160 }}>
                <div className="h-full rounded-full" style={{ width: `${(doneTasks / totalTasks) * 100}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.green})` }} />
              </div>
              <div className="flex items-center gap-3 ml-1" style={{ color: C.textMuted }}>
                <span>🟣 Opus (conductor)</span>
                <span>🟣 Haiku ×1</span>
                <span>🔵 Gemini ×2</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5 text-xs" style={{ color: C.amber }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.amber }} />
                2 workers active
              </div>
            </div>
          )}

          {/* Main content + task detail */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {view === "kanban" && <KanbanView selectedTask={selectedTask} setSelectedTask={setSelectedTask} />}
              {view === "terminal" && <TerminalView devMode={devMode} />}
              {view === "usage" && <UsageView />}
              {view === "review" && <CodeReviewView onDone={() => setView("done")} />}
              {view === "done" && <DoneView onNew={() => { setShowSetup(true); setView("kanban"); }} />}
              {view === "settings" && (
                <div className="h-full flex items-center justify-center text-xs" style={{ color: C.textMuted }}>
                  Settings panel coming soon
                </div>
              )}
            </div>

            {/* Task detail panel (only on kanban) */}
            {view === "kanban" && selectedTask && (
              <TaskDetail taskId={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
          </div>
        </div>

        {/* Setup overlay */}
        {showSetup && <SetupPanel onClose={() => setShowSetup(false)} onLaunch={() => setShowSetup(false)} />}
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center gap-4 px-4 border-t flex-shrink-0"
        style={{ height: 26, borderColor: C.border, background: "#07070f", fontSize: 11 }}>
        <div className="flex items-center gap-1.5" style={{ color: C.textMuted }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
          5 agents scanned
        </div>
        <span style={{ color: C.borderStrong }}>|</span>
        <div style={{ color: C.textMuted }}>Session: <span style={{ color: C.textSecondary }}>{session.name}</span></div>
        <span style={{ color: C.borderStrong }}>|</span>
        <div style={{ color: C.textMuted }}>Progress: <span style={{ color: C.amber }}>35%</span></div>
        <div className="flex-1" />
        {devMode && (
          <div className="flex items-center gap-1" style={{ color: C.accentText }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.accentText }} />
            Developer Mode
          </div>
        )}
        <span style={{ color: C.borderStrong }}>|</span>
        <span style={{ color: C.textMuted }}>OrchestAI v0.9.1</span>
      </div>
    </div>
  );
}
