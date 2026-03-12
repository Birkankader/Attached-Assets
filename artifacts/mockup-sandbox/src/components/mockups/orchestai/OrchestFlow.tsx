import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ─────────────────────────── shared data ─────────────────────────── */

const ALL_AGENTS = [
  { id: "claude-opus", name: "Claude Opus 4", cli: "claude", icon: "🟣", auth: true, version: "v1.2.3", model: "claude-opus-4-5" },
  { id: "claude-haiku", name: "Claude Haiku 3.5", cli: "claude", icon: "🟣", auth: true, version: "v1.2.3", model: "claude-haiku-3-5" },
  { id: "gemini", name: "Gemini 2.5 Pro", cli: "gemini", icon: "🔵", auth: true, version: "v0.9.1", model: "gemini-2.5-pro" },
  { id: "codex", name: "Codex CLI", cli: "codex", icon: "⬛", auth: false, version: "v0.1.2504", model: "gpt-4o" },
  { id: "gpt4", name: "GPT-4.1", cli: "openai", icon: "🟢", auth: false, version: null, model: null },
];

const STEPS = ["Setup", "Launch", "Orchestrating", "Monitor", "Code Review", "Done"];
const STEP_DESC = [
  "Discover & configure agents",
  "Confirm & launch",
  "Track task progress",
  "Live terminal access",
  "Review & approve",
  "Merged & complete",
];

/* ─────────────────────────── shared topbar ─────────────────────────── */

function TopBar({ step, setStep }: { step: number; setStep: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b shrink-0"
      style={{ borderColor: "#1e2035", background: "#0d0d1a" }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>♦</div>
        <span className="text-sm font-semibold tracking-wide" style={{ color: "#c4b5fd" }}>OrchestAI</span>
        <span className="text-xs ml-1" style={{ color: "#374151" }}>v0.9</span>
      </div>

      {/* Step breadcrumb */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all"
            style={{
              background: i === step ? "#1e1b4b" : "transparent",
              color: i === step ? "#a5b4fc" : i < step ? "#4b5563" : "#374151",
            }}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: i < step ? "#22c55e" : i === step ? "#6366f1" : "#1e2035",
                color: "#fff",
              }}>
              {i < step ? "✓" : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs" style={{ color: "#6b7280" }}>
        <span>Usage</span>
        <span>Settings</span>
      </div>
    </div>
  );
}

/* ─────────────────────────── SCREEN 1: Setup ─────────────────────────── */

function ScreenSetup({ onNext }: { onNext: () => void }) {
  const [master, setMaster] = useState<string>("claude-opus");
  const [workers, setWorkers] = useState<Record<string, number>>({ gemini: 2, "claude-haiku": 1 });
  const [task, setTask] = useState(
    "Build a full-stack task management app with React frontend and Node.js API. Include user auth, CRUD for tasks, real-time updates, and responsive mobile design."
  );
  const [devMode, setDevMode] = useState(false);
  const [autoMerge, setAutoMerge] = useState(false);
  const [autoPR, setAutoPR] = useState(true);

  const totalWorkers = Object.values(workers).reduce((a, b) => a + b, 0);
  const masterAgent = ALL_AGENTS.find(a => a.id === master);

  const toggleWorker = (id: string) => {
    if (!ALL_AGENTS.find(a => a.id === id)?.auth) return;
    setWorkers(prev => {
      if (prev[id]) { const n = { ...prev }; delete n[id]; return n; }
      return { ...prev, [id]: 1 };
    });
  };
  const changeCount = (id: string, d: number) => setWorkers(prev => ({ ...prev, [id]: Math.max(1, Math.min(4, (prev[id] || 1) + d)) }));

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Agent list */}
      <div className="w-72 flex flex-col border-r" style={{ borderColor: "#1e2035", background: "#090912" }}>
        <div className="px-4 pt-5 pb-3">
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#6366f1" }}>Discovered Agents</div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#4b5563" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Scanning ~/.config…
          </div>
        </div>
        <ScrollArea className="flex-1 px-3 pb-4">
          <div className="space-y-2">
            {ALL_AGENTS.map(agent => (
              <div key={agent.id} className="rounded-xl p-3 border transition-all"
                style={{ background: master === agent.id ? "#111128" : "#0d0d1a", borderColor: master === agent.id ? "#6366f1" : "#1e2035", opacity: !agent.auth ? 0.55 : 1 }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{agent.icon}</span>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>{agent.name}</div>
                      <div className="text-xs" style={{ color: "#4b5563" }}>{agent.version ?? "not installed"}</div>
                    </div>
                  </div>
                  {agent.auth
                    ? <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#052e16", color: "#4ade80" }}>✓ Auth</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#1a0a00", color: "#f97316" }}>Need Auth</span>}
                </div>
                {agent.auth ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => setMaster(agent.id)} className="flex-1 py-1 rounded-md text-xs font-medium"
                      style={{ background: master === agent.id ? "#6366f1" : "#1a1a2e", color: master === agent.id ? "#fff" : "#8b8fa8", border: master === agent.id ? "none" : "1px solid #2a2a45" }}>
                      {master === agent.id ? "★ Master" : "Set Master"}
                    </button>
                    <button onClick={() => toggleWorker(agent.id)} className="flex-1 py-1 rounded-md text-xs font-medium"
                      style={{ background: workers[agent.id] ? "#1e1b4b" : "#1a1a2e", color: workers[agent.id] ? "#a5b4fc" : "#8b8fa8", border: workers[agent.id] ? "1px solid #4338ca" : "1px solid #2a2a45" }}>
                      {workers[agent.id] ? `Worker ×${workers[agent.id]}` : "+ Worker"}
                    </button>
                  </div>
                ) : (
                  <button className="w-full py-1 rounded-md text-xs font-medium" style={{ background: "#1a1010", color: "#f97316", border: "1px solid #3a1a00" }}>
                    Login to use →
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Center config */}
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>New Orchestration</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>Configure your conductor and workers, then describe the task.</p>
        </div>

        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#6366f1" }}>Task Description</label>
        <textarea value={task} onChange={e => setTask(e.target.value)} rows={4}
          className="w-full rounded-xl p-4 text-sm resize-none leading-relaxed mb-6"
          style={{ background: "#111120", border: "1px solid #2a2a45", color: "#e2e8f0", outline: "none" }} />

        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: "#6366f1" }}>Conductor (Master Agent)</label>
        {masterAgent && (
          <div className="rounded-xl p-4 border flex items-center gap-4 mb-6" style={{ background: "#111120", borderColor: "#4338ca" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg, #4338ca, #7c3aed)" }}>{masterAgent.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: "#e2e8f0" }}>{masterAgent.name}</div>
              <div className="text-xs" style={{ color: "#6b7280" }}>{masterAgent.model} · {masterAgent.version}</div>
              <div className="text-xs mt-1" style={{ color: "#a5b4fc" }}>Will decompose tasks & orchestrate all workers</div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#1e1b4b", color: "#818cf8" }}>CONDUCTOR</div>
          </div>
        )}

        <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: "#6366f1" }}>Worker Agents</label>
        <div className="space-y-2 mb-8">
          {Object.entries(workers).map(([id, count]) => {
            const ag = ALL_AGENTS.find(a => a.id === id)!;
            return (
              <div key={id} className="rounded-xl p-3 border flex items-center gap-3" style={{ background: "#111120", borderColor: "#2a2a45" }}>
                <span className="text-lg">{ag.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{ag.name}</div>
                  <div className="text-xs" style={{ color: "#6b7280" }}>{ag.model}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeCount(id, -1)} className="w-6 h-6 rounded-md text-xs flex items-center justify-center" style={{ background: "#1e2035", color: "#9ca3af" }}>−</button>
                  <span className="w-8 text-center text-sm font-bold" style={{ color: "#e2e8f0" }}>×{count}</span>
                  <button onClick={() => changeCount(id, 1)} className="w-6 h-6 rounded-md text-xs flex items-center justify-center" style={{ background: "#1e2035", color: "#9ca3af" }}>+</button>
                  <button onClick={() => toggleWorker(id)} className="ml-1 text-xs" style={{ color: "#4b5563" }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onNext} className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all"
          style={{ background: master && totalWorkers > 0 ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#1e2035", color: master && totalWorkers > 0 ? "#fff" : "#4b5563" }}>
          {master && totalWorkers > 0 ? `Continue → Review & Launch` : "Select master & workers to continue"}
        </button>
      </div>

      {/* Right: summary & settings */}
      <div className="w-60 border-l flex flex-col" style={{ borderColor: "#1e2035", background: "#090912" }}>
        <div className="px-4 pt-5 pb-3"><div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6366f1" }}>Summary</div></div>
        <div className="flex-1 px-4 space-y-4">
          <div className="rounded-xl p-3 border" style={{ background: "#111120", borderColor: "#1e2035" }}>
            <div className="text-xs font-medium mb-2" style={{ color: "#9ca3af" }}>Git Worktrees</div>
            {Object.entries(workers).flatMap(([id, count]) => {
              const ag = ALL_AGENTS.find(a => a.id === id)!;
              return Array.from({ length: count }, (_, i) => (
                <div key={`${id}-${i}`} className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "#6b7280" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4338ca" }} />
                  {ag.cli}-worker-{i + 1}
                </div>
              ));
            })}
          </div>
          <div className="rounded-xl p-3 border" style={{ background: "#111120", borderColor: "#1e2035" }}>
            <div className="text-xs font-medium mb-3" style={{ color: "#9ca3af" }}>Settings</div>
            {[
              { label: "Developer Mode", val: devMode, set: setDevMode },
              { label: "Auto Merge", val: autoMerge, set: setAutoMerge },
              { label: "Auto PR", val: autoPR, set: setAutoPR },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between mb-3">
                <span className="text-xs" style={{ color: "#9ca3af" }}>{s.label}</span>
                <button onClick={() => s.set(!s.val)} className="w-8 h-4 rounded-full flex items-center px-0.5" style={{ background: s.val ? "#4338ca" : "#1e2035" }}>
                  <div className="w-3 h-3 rounded-full bg-white transition-all" style={{ marginLeft: s.val ? "auto" : "0" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SCREEN 2: Launch Confirmation ─────────────────────────── */

function ScreenLaunch({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const config = { master: "Claude Opus 4", workers: [{ name: "Gemini 2.5 Pro", count: 2, icon: "🔵" }, { name: "Claude Haiku 3.5", count: 1, icon: "🟣" }], totalWorkers: 3, task: "Build a full-stack task management app with React frontend and Node.js API. Include user auth, CRUD for tasks, real-time updates, and responsive mobile design." };
  const tasks = [
    "Setup project structure & monorepo config",
    "Design database schema (users, tasks, sessions)",
    "Build REST API endpoints for task CRUD",
    "Implement JWT authentication & user registration",
    "React frontend: task list & kanban board UI",
    "Real-time WebSocket updates",
    "Mobile responsive design & PWA manifest",
    "End-to-end testing & CI pipeline",
  ];

  return (
    <div className="flex-1 overflow-y-auto px-0">
      <div className="max-w-3xl mx-auto py-10 px-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: "linear-gradient(135deg, #4338ca, #7c3aed)" }}>♦</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#e2e8f0" }}>Ready to Launch Orchestra</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>Review the configuration before starting. Master agent will decompose and assign these subtasks.</p>
        </div>

        {/* Config cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-4 border text-center" style={{ background: "#111120", borderColor: "#4338ca" }}>
            <div className="text-2xl mb-1">🟣</div>
            <div className="text-xs font-semibold" style={{ color: "#a5b4fc" }}>CONDUCTOR</div>
            <div className="text-sm font-bold mt-1" style={{ color: "#e2e8f0" }}>{config.master}</div>
          </div>
          {config.workers.map(w => (
            <div key={w.name} className="rounded-xl p-4 border text-center" style={{ background: "#111120", borderColor: "#2a2a45" }}>
              <div className="text-2xl mb-1">{w.icon}</div>
              <div className="text-xs font-semibold" style={{ color: "#6b7280" }}>WORKER ×{w.count}</div>
              <div className="text-sm font-bold mt-1" style={{ color: "#e2e8f0" }}>{w.name}</div>
            </div>
          ))}
        </div>

        {/* Task */}
        <div className="rounded-xl p-4 border mb-6" style={{ background: "#111120", borderColor: "#2a2a45" }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>Task</div>
          <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>{config.task}</p>
        </div>

        {/* Predicted subtasks */}
        <div className="rounded-xl border overflow-hidden mb-8" style={{ borderColor: "#2a2a45" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#111120" }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>Predicted Subtasks (by Master)</div>
            <span className="text-xs" style={{ color: "#4b5563" }}>8 tasks · 3 workers</span>
          </div>
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-t text-sm" style={{ borderColor: "#1e2035", background: i % 2 === 0 ? "#0d0d1a" : "#090912" }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#1e2035", color: "#6b7280" }}>{i + 1}</span>
              <span style={{ color: "#d1d5db" }}>{t}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ background: "#1e2035", color: "#9ca3af" }}>← Back</button>
          <button onClick={onNext} className="flex-1 py-3 rounded-xl text-sm font-bold tracking-wide" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            ▶ Launch Orchestra
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SCREEN 3: Orchestrating (Kanban) ─────────────────────────── */

const TASKS_DATA = [
  { id: "T1", title: "Setup project structure & monorepo config", agent: "Claude Haiku", icon: "🟣", status: "done", branch: "feat/project-structure", duration: "2m 14s", progress: 100 },
  { id: "T2", title: "Design database schema", agent: "Gemini Pro #1", icon: "🔵", status: "done", branch: "feat/db-schema", duration: "3m 02s", progress: 100 },
  { id: "T3", title: "Build REST API endpoints for task CRUD", agent: "Gemini Pro #2", icon: "🔵", status: "in_progress", branch: "feat/api-endpoints", duration: "1m 47s", progress: 68 },
  { id: "T4", title: "Implement JWT authentication", agent: "Claude Haiku", icon: "🟣", status: "in_progress", branch: "feat/auth", duration: "2m 33s", progress: 45 },
  { id: "T5", title: "React frontend: task list & kanban UI", agent: "Gemini Pro #1", icon: "🔵", status: "waiting", branch: "feat/frontend-ui", duration: null, progress: 0 },
  { id: "T6", title: "Real-time WebSocket updates", agent: "Gemini Pro #2", icon: "🔵", status: "waiting", branch: "feat/realtime", duration: null, progress: 0 },
  { id: "T7", title: "Mobile responsive design & PWA", agent: "Claude Haiku", icon: "🟣", status: "waiting", branch: "feat/mobile", duration: null, progress: 0 },
  { id: "T8", title: "End-to-end testing & CI pipeline", agent: "Gemini Pro #1", icon: "🔵", status: "waiting", branch: "feat/testing", duration: null, progress: 0 },
];

const ST_COL: Record<string, string> = { done: "#4ade80", in_progress: "#f59e0b", waiting: "#4b5563" };
const ST_BG: Record<string, string> = { done: "#052e16", in_progress: "#1c1000", waiting: "#111120" };
const ST_LBL: Record<string, string> = { done: "Done", in_progress: "In Progress", waiting: "Queued" };

function ScreenOrchestrating({ onNext, onMonitor }: { onNext: () => void; onMonitor: () => void }) {
  const [sel, setSel] = useState<string>("T3");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const selected = TASKS_DATA.find(t => t.id === sel);
  const done = TASKS_DATA.filter(t => t.status === "done").length;

  return (
    <div className="flex flex-1 overflow-hidden flex-col">
      {/* Stats strip */}
      <div className="flex items-center gap-4 px-6 py-2.5 border-b text-xs shrink-0" style={{ borderColor: "#1e2035", background: "#090912" }}>
        <div className="flex items-center gap-1.5" style={{ color: "#9ca3af" }}><span style={{ color: "#4ade80" }}>✓</span>{done}/{TASKS_DATA.length} tasks done</div>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e2035" }}>
          <div className="h-full rounded-full" style={{ width: `${(done / TASKS_DATA.length) * 100}%`, background: "linear-gradient(90deg, #6366f1, #4ade80)" }} />
        </div>
        <div className="flex items-center gap-3" style={{ color: "#6b7280" }}>
          <span>🟣 Claude Opus (conductor)</span>
          <span>🟣 ×1 Haiku</span>
          <span>🔵 ×2 Gemini</span>
        </div>
        <button onClick={onMonitor} className="px-2.5 py-1 rounded-md transition-all text-xs" style={{ background: "#1e1b4b", color: "#a5b4fc" }}>⌨ Open Monitor</button>
        <div className="flex items-center gap-1">
          {(["kanban", "list"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className="px-2.5 py-1 rounded-md text-xs"
              style={{ background: view === v ? "#1e1b4b" : "transparent", color: view === v ? "#a5b4fc" : "#6b7280" }}>
              {v === "kanban" ? "⊞ Kanban" : "≡ List"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Board */}
        <div className="flex-1 overflow-hidden">
          {view === "kanban" ? (
            <div className="flex h-full gap-4 p-5 overflow-x-auto">
              {["waiting", "in_progress", "done"].map(col => {
                const colTasks = TASKS_DATA.filter(t => t.status === col);
                return (
                  <div key={col} className="flex-shrink-0 w-60">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: ST_COL[col] }} />
                      <span className="text-xs font-semibold" style={{ color: "#9ca3af" }}>{ST_LBL[col]}</span>
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#1e2035", color: "#6b7280" }}>{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map(task => (
                        <div key={task.id} onClick={() => setSel(task.id)}
                          className="rounded-xl p-3 border cursor-pointer transition-all"
                          style={{ background: sel === task.id ? "#151530" : ST_BG[task.status], borderColor: sel === task.id ? "#6366f1" : "#1e2035" }}>
                          <div className="text-xs font-medium mb-2 leading-snug" style={{ color: "#d1d5db" }}>{task.title}</div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs">{task.icon}</span>
                            <span className="text-xs" style={{ color: "#6b7280" }}>{task.agent}</span>
                          </div>
                          {task.status === "in_progress" && (
                            <div>
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1e2035" }}>
                                <div className="h-full rounded-full" style={{ width: `${task.progress}%`, background: "#f59e0b" }} />
                              </div>
                              <div className="text-xs mt-1" style={{ color: "#6b7280" }}>{task.progress}% · {task.duration}</div>
                            </div>
                          )}
                          {task.status === "done" && <div className="text-xs" style={{ color: "#4b5563" }}>✓ {task.duration}</div>}
                          <div className="mt-2 text-xs font-mono truncate" style={{ color: "#374151" }}>{task.branch}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-5 space-y-1.5">
                {TASKS_DATA.map(task => (
                  <div key={task.id} onClick={() => setSel(task.id)}
                    className="rounded-xl px-4 py-3 border flex items-center gap-4 cursor-pointer"
                    style={{ background: sel === task.id ? "#151530" : "#111120", borderColor: sel === task.id ? "#6366f1" : "#1e2035" }}>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center flex-shrink-0"
                      style={{ background: ST_BG[task.status], color: ST_COL[task.status] }}>{ST_LBL[task.status]}</span>
                    <span className="text-sm flex-1" style={{ color: "#d1d5db" }}>{task.title}</span>
                    <span className="text-xs" style={{ color: "#6b7280" }}>{task.icon} {task.agent}</span>
                    <span className="text-xs font-mono" style={{ color: "#374151" }}>{task.branch}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Task detail */}
        {selected && (
          <div className="w-64 border-l flex flex-col" style={{ borderColor: "#1e2035", background: "#090912" }}>
            <div className="px-4 pt-5 pb-3 border-b" style={{ borderColor: "#1e2035" }}>
              <div className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex mb-2" style={{ background: ST_BG[selected.status], color: ST_COL[selected.status] }}>{ST_LBL[selected.status]}</div>
              <div className="text-sm font-semibold leading-snug" style={{ color: "#e2e8f0" }}>{selected.title}</div>
            </div>
            <div className="flex-1 px-4 py-4 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>Assigned Agent</div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{selected.icon}</span>
                  <div><div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{selected.agent}</div><div className="text-xs" style={{ color: "#6b7280" }}>Active · worktree ready</div></div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>Branch</div>
                <div className="rounded-lg px-3 py-2 text-xs font-mono" style={{ background: "#111120", color: "#a5b4fc", border: "1px solid #1e2035" }}>{selected.branch}</div>
              </div>
              {selected.status === "in_progress" && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>Progress</span>
                    <span style={{ color: "#f59e0b" }}>{selected.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1e2035" }}>
                    <div className="h-full rounded-full" style={{ width: `${selected.progress}%`, background: "#f59e0b" }} />
                  </div>
                </div>
              )}
              {selected.status === "done" && (
                <div className="rounded-xl p-3 border" style={{ background: "#052e16", borderColor: "#14532d" }}>
                  <div className="text-xs font-medium mb-1" style={{ color: "#4ade80" }}>✓ Awaiting Merge</div>
                  <div className="text-xs mb-2" style={{ color: "#166534" }}>PR opened · Code review passed</div>
                  <button className="w-full mt-1 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#14532d", color: "#4ade80" }}>Merge PR →</button>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>Reassign To</div>
                <select className="w-full rounded-lg px-3 py-2 text-xs" style={{ background: "#111120", color: "#9ca3af", border: "1px solid #2a2a45", outline: "none" }}>
                  <option>Claude Haiku 3.5</option><option>Gemini Pro #1</option><option>Gemini Pro #2</option>
                </select>
              </div>
              <button onClick={onNext} className="w-full py-2 rounded-xl text-xs font-semibold mt-2" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
                All done → Code Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── SCREEN 4: Monitor ─────────────────────────── */

const MONITOR_AGENTS = [
  { id: "master", name: "Claude Opus 4", role: "CONDUCTOR", icon: "🟣", status: "orchestrating", branch: "main", color: "#8b5cf6", logs: [{ t: "14:32:01", type: "info", msg: "Analyzing task requirements..." }, { t: "14:32:05", type: "success", msg: "Assigned 8 tasks to workers" }, { t: "14:36:08", type: "success", msg: "T1 code review passed ✓" }, { t: "14:36:17", type: "success", msg: "T2 code review passed ✓" }, { t: "14:36:22", type: "info", msg: "Monitoring remaining workers..." }] },
  { id: "g1", name: "Gemini 2.5 Pro #1", role: "WORKER", icon: "🔵", status: "running", branch: "feat/api-endpoints", color: "#3b82f6", logs: [{ t: "14:33:00", type: "info", msg: "Starting task: REST API endpoints" }, { t: "14:34:22", type: "info", msg: "Implementing POST /tasks" }, { t: "14:35:45", type: "info", msg: "Implementing PUT /tasks/:id" }, { t: "14:36:47", type: "warning", msg: "Rate limit: slowing down" }] },
  { id: "g2", name: "Gemini 2.5 Pro #2", role: "WORKER", icon: "🔵", status: "idle", branch: "feat/realtime", color: "#3b82f6", logs: [{ t: "14:34:52", type: "success", msg: "Task T2 complete ✓" }, { t: "14:35:00", type: "info", msg: "Waiting for next task..." }] },
  { id: "haiku", name: "Claude Haiku 3.5", role: "WORKER", icon: "🟣", status: "running", branch: "feat/auth", color: "#a78bfa", logs: [{ t: "14:33:00", type: "info", msg: "Task: JWT authentication" }, { t: "14:34:10", type: "info", msg: "Building /auth/register endpoint" }, { t: "14:36:00", type: "info", msg: "Adding token refresh logic..." }] },
];
const MSTC: Record<string, string> = { orchestrating: "#8b5cf6", running: "#f59e0b", idle: "#4b5563", done: "#4ade80" };
const MSTL: Record<string, string> = { orchestrating: "Orchestrating", running: "Working", idle: "Idle", done: "Done" };
const LOGC: Record<string, string> = { info: "#6b7280", success: "#4ade80", warning: "#f59e0b", error: "#f87171" };

function ScreenMonitor({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [sel, setSel] = useState("g1");
  const [devMode, setDevMode] = useState(true);
  const [input, setInput] = useState("");
  const agent = MONITOR_AGENTS.find(a => a.id === sel)!;

  return (
    <div className="flex flex-1 overflow-hidden flex-col">
      <div className="flex items-center gap-2 px-6 py-2.5 border-b shrink-0 text-xs" style={{ borderColor: "#1e2035", background: "#090912" }}>
        <button onClick={onBack} className="px-2.5 py-1 rounded-md" style={{ background: "#1e2035", color: "#9ca3af" }}>← Board</button>
        <div className="flex-1" />
        <span style={{ color: "#6b7280" }}>Developer Mode</span>
        <button onClick={() => setDevMode(!devMode)} className="w-9 h-4 rounded-full flex items-center px-0.5" style={{ background: devMode ? "#6366f1" : "#1e2035" }}>
          <div className="w-3 h-3 rounded-full bg-white" style={{ marginLeft: devMode ? "auto" : "0" }} />
        </button>
        <button onClick={onNext} className="ml-2 px-3 py-1 rounded-md font-medium" style={{ background: "#052e16", color: "#4ade80" }}>All done → Code Review</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Agent list */}
        <div className="w-52 border-r flex flex-col" style={{ borderColor: "#1e2035", background: "#090912" }}>
          <div className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#6366f1" }}>Agents</div>
          <div className="flex-1 px-3 space-y-1.5 pb-4">
            {MONITOR_AGENTS.map(a => (
              <button key={a.id} onClick={() => setSel(a.id)}
                className="w-full rounded-xl p-3 text-left border transition-all"
                style={{ background: sel === a.id ? "#151530" : "transparent", borderColor: sel === a.id ? "#6366f1" : "transparent" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{a.icon}</span>
                  <div className="text-xs font-medium truncate" style={{ color: "#d1d5db" }}>{a.name}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: MSTC[a.status] }} />
                  <span className="text-xs" style={{ color: MSTC[a.status] }}>{MSTL[a.status]}</span>
                </div>
                <div className="text-xs font-mono mt-1 truncate" style={{ color: "#374151" }}>{a.branch}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{ borderColor: "#1e2035" }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{agent.icon}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{agent.name}</div>
                <div className="text-xs" style={{ color: "#6b7280" }}>{agent.role} · <span className="font-mono" style={{ color: "#a5b4fc" }}>{agent.branch}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ background: MSTC[agent.status] + "18", color: MSTC[agent.status], border: `1px solid ${MSTC[agent.status]}40` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: MSTC[agent.status] }} />{MSTL[agent.status]}
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col" style={{ background: "#050508" }}>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-1 font-mono text-xs">
                {agent.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span style={{ color: "#374151", flexShrink: 0 }}>{log.t}</span>
                    <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: LOGC[log.type] }} />
                    <span style={{ color: LOGC[log.type] }}>{log.msg}</span>
                  </div>
                ))}
                {agent.status === "running" && <div className="flex gap-3 mt-2"><span style={{ color: "#374151" }}>14:37:01</span><span className="w-2 h-2 rounded-full mt-1" style={{ background: "#f59e0b" }} /><span style={{ color: "#f59e0b" }}>▋</span></div>}
              </div>
            </ScrollArea>
            {devMode && (
              <div className="border-t px-4 py-3 shrink-0" style={{ borderColor: "#1e2035" }}>
                <div className="text-xs mb-2" style={{ color: "#6b7280" }}>Developer Mode — inject prompt to {agent.name}</div>
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a prompt or instruction…"
                    className="flex-1 rounded-lg px-3 py-2 text-xs font-mono"
                    style={{ background: "#111120", border: "1px solid #2a2a45", color: "#e2e8f0", outline: "none" }} />
                  <button className="px-4 py-2 rounded-lg text-xs font-medium" style={{ background: input ? "#6366f1" : "#1e2035", color: input ? "#fff" : "#4b5563" }}>Send ↵</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PR queue */}
        <div className="w-60 border-l flex flex-col" style={{ borderColor: "#1e2035", background: "#090912" }}>
          <div className="px-4 pt-4 pb-2 border-b text-xs font-semibold uppercase tracking-widest" style={{ borderColor: "#1e2035", color: "#6366f1" }}>Merge Queue</div>
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-2">
              {[
                { pr: "PR #11", branch: "feat/project-structure", agent: "Claude Haiku", status: "merged" },
                { pr: "PR #12", branch: "feat/db-schema", agent: "Gemini #1", status: "ready" },
                { pr: "PR #13", branch: "feat/auth", agent: "Claude Haiku", status: "pending" },
                { pr: "PR #14", branch: "feat/api-endpoints", agent: "Gemini #2", status: "pending" },
              ].map((pr, i) => (
                <div key={i} className="rounded-xl p-3 border"
                  style={{ background: pr.status === "merged" ? "#071a0e" : pr.status === "ready" ? "#0a0a1e" : "#111120", borderColor: pr.status === "merged" ? "#14532d" : pr.status === "ready" ? "#4338ca" : "#1e2035" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold" style={{ color: pr.status === "merged" ? "#4ade80" : pr.status === "ready" ? "#818cf8" : "#6b7280" }}>{pr.pr}</span>
                  </div>
                  <div className="text-xs font-mono mb-2 truncate" style={{ color: "#9ca3af" }}>{pr.branch}</div>
                  {pr.status === "ready" && <button className="w-full py-1.5 rounded-lg text-xs font-medium" style={{ background: "#1e1b4b", color: "#818cf8" }}>Merge →</button>}
                  {pr.status === "merged" && <div className="text-xs" style={{ color: "#4ade80" }}>✓ Merged to main</div>}
                  {pr.status === "pending" && <div className="text-xs" style={{ color: "#4b5563" }}>⏳ In progress</div>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SCREEN 5: Code Review ─────────────────────────── */

function ScreenCodeReview({ onNext }: { onNext: () => void }) {
  const [comment, setComment] = useState("");
  const [userReviewed, setUserReviewed] = useState(false);

  const reviewItems = [
    { file: "src/routes/tasks.ts", status: "ok", note: "Clean RESTful design. Proper error handling." },
    { file: "src/auth/middleware.ts", status: "ok", note: "JWT validation looks correct. Token expiry handled." },
    { file: "src/schema/users.ts", status: "warn", note: "Add index to users.email for query performance." },
    { file: "client/src/App.tsx", status: "ok", note: "Component structure is solid. Consider lazy loading routes." },
    { file: "client/src/hooks/useTasks.ts", status: "ok", note: "Good use of React Query. Cache invalidation correct." },
    { file: "docker-compose.yml", status: "warn", note: "Expose only necessary ports in production config." },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #4338ca, #7c3aed)" }}>🟣</div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#6366f1" }}>Master Agent Code Review</div>
            <h1 className="text-xl font-bold" style={{ color: "#e2e8f0" }}>Claude Opus 4 has reviewed all 8 tasks</h1>
            <p className="text-sm" style={{ color: "#6b7280" }}>Review passed with 2 minor suggestions. You can accept or leave a comment.</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[{ label: "Tasks Completed", val: "8/8", color: "#4ade80" }, { label: "PRs Opened", val: "8", color: "#818cf8" }, { label: "Issues Found", val: "2 minor", color: "#f59e0b" }].map(s => (
            <div key={s.label} className="rounded-xl p-4 border text-center" style={{ background: "#111120", borderColor: "#2a2a45" }}>
              <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs" style={{ color: "#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* File review */}
        <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: "#2a2a45" }}>
          <div className="px-4 py-3" style={{ background: "#111120" }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>File-by-File Review</div>
          </div>
          {reviewItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-t text-xs" style={{ borderColor: "#1e2035", background: i % 2 === 0 ? "#0d0d1a" : "#090912" }}>
              <span className="text-base">{item.status === "ok" ? "✅" : "⚠️"}</span>
              <span className="font-mono w-48 flex-shrink-0" style={{ color: "#a5b4fc" }}>{item.file}</span>
              <span style={{ color: "#9ca3af" }}>{item.note}</span>
            </div>
          ))}
        </div>

        {/* Master summary */}
        <div className="rounded-xl p-4 border mb-6" style={{ background: "#0a0a1e", borderColor: "#2a2a45" }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>Master Agent Summary</div>
          <p className="text-sm leading-relaxed" style={{ color: "#d1d5db" }}>
            Overall the codebase is well-structured and follows best practices. Authentication is secure, API endpoints are RESTful, and the frontend architecture is clean. Two minor suggestions: add a database index on <span className="font-mono px-1 rounded" style={{ background: "#1e2035" }}>users.email</span> and restrict Docker port exposure in production. No blocking issues — all 8 PRs are ready to merge.
          </p>
        </div>

        {/* User review */}
        {!userReviewed ? (
          <div className="rounded-xl p-4 border mb-6" style={{ background: "#111120", borderColor: "#2a2a45" }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6366f1" }}>Your Review (Optional)</div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment or feedback for the master agent…" rows={3}
              className="w-full rounded-xl p-3 text-sm resize-none"
              style={{ background: "#090912", border: "1px solid #2a2a45", color: "#e2e8f0", outline: "none" }} />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setUserReviewed(true)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
                Submit & Accept Review
              </button>
              <button onClick={onNext} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "#1e2035", color: "#9ca3af" }}>
                Skip — Accept Master's Review
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4 border mb-6" style={{ background: "#052e16", borderColor: "#14532d" }}>
            <div className="text-sm font-semibold mb-1" style={{ color: "#4ade80" }}>✓ Your review submitted</div>
            <div className="text-xs" style={{ color: "#166534" }}>Master agent will incorporate your feedback before merging.</div>
          </div>
        )}

        <button onClick={onNext} className="w-full py-3.5 rounded-xl text-sm font-bold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
          Accept & Merge All PRs →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── SCREEN 6: Done ─────────────────────────── */

function ScreenDone({ onRestart }: { onRestart: () => void }) {
  const prs = [
    { pr: "#11", branch: "feat/project-structure", agent: "Claude Haiku", dur: "2m 14s" },
    { pr: "#12", branch: "feat/db-schema", agent: "Gemini Pro #1", dur: "3m 02s" },
    { pr: "#13", branch: "feat/api-endpoints", agent: "Gemini Pro #2", dur: "4m 18s" },
    { pr: "#14", branch: "feat/auth", agent: "Claude Haiku", dur: "3m 55s" },
    { pr: "#15", branch: "feat/frontend-ui", agent: "Gemini Pro #1", dur: "6m 11s" },
    { pr: "#16", branch: "feat/realtime", agent: "Gemini Pro #2", dur: "5m 02s" },
    { pr: "#17", branch: "feat/mobile", agent: "Claude Haiku", dur: "4m 44s" },
    { pr: "#18", branch: "feat/testing", agent: "Gemini Pro #1", dur: "3m 30s" },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5"
            style={{ background: "linear-gradient(135deg, #052e16, #14532d)", border: "2px solid #22c55e" }}>✓</div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#4ade80" }}>Orchestra Complete!</h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>All 8 tasks completed, reviewed, and merged to main.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Tasks Done", val: "8", icon: "✓" },
            { label: "PRs Merged", val: "8", icon: "⑂" },
            { label: "Total Time", val: "33m", icon: "⏱" },
            { label: "Agents Used", val: "4", icon: "♦" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border text-center" style={{ background: "#111120", borderColor: "#1e2035" }}>
              <div className="text-xl mb-1" style={{ color: "#4ade80" }}>{s.icon}</div>
              <div className="text-xl font-bold" style={{ color: "#e2e8f0" }}>{s.val}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* PR list */}
        <div className="rounded-xl border overflow-hidden mb-8" style={{ borderColor: "#14532d" }}>
          <div className="px-4 py-3" style={{ background: "#071a0e" }}>
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4ade80" }}>Merged Pull Requests</div>
          </div>
          {prs.map((pr, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-t text-xs" style={{ borderColor: "#0d3321", background: i % 2 === 0 ? "#071a0e" : "#052e16" }}>
              <span className="font-mono font-bold" style={{ color: "#4ade80" }}>{pr.pr}</span>
              <span className="font-mono flex-1" style={{ color: "#6ee7b7" }}>{pr.branch}</span>
              <span style={{ color: "#4b5563" }}>{pr.agent}</span>
              <span style={{ color: "#166534" }}>{pr.dur}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onRestart} className="flex-1 py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            ♦ Start New Orchestration
          </button>
          <button className="px-6 py-3.5 rounded-xl text-sm font-medium" style={{ background: "#1e2035", color: "#9ca3af" }}>
            View on GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── ROOT ─────────────────────────── */

export function OrchestFlow() {
  const [step, setStep] = useState(0);

  const goTo = (n: number) => setStep(n);

  return (
    <div className="h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 100%)", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      <TopBar step={step} setStep={setStep} />

      {step === 0 && <ScreenSetup onNext={() => goTo(1)} />}
      {step === 1 && <ScreenLaunch onNext={() => goTo(2)} onBack={() => goTo(0)} />}
      {step === 2 && <ScreenOrchestrating onNext={() => goTo(4)} onMonitor={() => goTo(3)} />}
      {step === 3 && <ScreenMonitor onBack={() => goTo(2)} onNext={() => goTo(4)} />}
      {step === 4 && <ScreenCodeReview onNext={() => goTo(5)} />}
      {step === 5 && <ScreenDone onRestart={() => goTo(0)} />}
    </div>
  );
}
