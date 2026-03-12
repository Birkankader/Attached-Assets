import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const AGENTS = [
  {
    id: "master",
    name: "Claude Opus 4",
    role: "CONDUCTOR",
    icon: "🟣",
    status: "orchestrating",
    branch: "main",
    quota: 82,
    quotaUsed: 14.8,
    quotaTotal: 18,
    color: "#8b5cf6",
    logs: [
      { time: "14:32:01", type: "info", msg: "Analyzing task requirements..." },
      { time: "14:32:04", type: "info", msg: "Decomposed into 8 subtasks" },
      { time: "14:32:05", type: "success", msg: "Assigned tasks to workers" },
      { time: "14:35:11", type: "info", msg: "Monitoring worker progress..." },
      { time: "14:36:02", type: "info", msg: "T1 (Haiku) completed. Reviewing..." },
      { time: "14:36:08", type: "success", msg: "T1 code review passed ✓" },
      { time: "14:36:09", type: "info", msg: "T2 (Gemini #1) completed. Reviewing..." },
      { time: "14:36:17", type: "success", msg: "T2 code review passed ✓" },
    ],
  },
  {
    id: "gemini-1",
    name: "Gemini 2.5 Pro #1",
    role: "WORKER",
    icon: "🔵",
    status: "running",
    branch: "feat/api-endpoints",
    quota: 45,
    quotaUsed: 8.2,
    quotaTotal: 18,
    color: "#3b82f6",
    logs: [
      { time: "14:33:00", type: "info", msg: "Starting task: REST API endpoints" },
      { time: "14:33:02", type: "info", msg: "Checking project structure..." },
      { time: "14:33:10", type: "info", msg: "Creating routes/tasks.ts..." },
      { time: "14:34:01", type: "info", msg: "Implementing GET /tasks" },
      { time: "14:34:22", type: "info", msg: "Implementing POST /tasks" },
      { time: "14:35:45", type: "info", msg: "Implementing PUT /tasks/:id" },
      { time: "14:36:10", type: "info", msg: "Adding middleware & validation..." },
      { time: "14:36:47", type: "warning", msg: "Rate limit: 2 req/s, slowing down" },
    ],
  },
  {
    id: "gemini-2",
    name: "Gemini 2.5 Pro #2",
    role: "WORKER",
    icon: "🔵",
    status: "idle",
    branch: "feat/realtime",
    quota: 45,
    quotaUsed: 3.1,
    quotaTotal: 18,
    color: "#3b82f6",
    logs: [
      { time: "14:33:00", type: "info", msg: "Initialized, awaiting task..." },
      { time: "14:33:05", type: "info", msg: "Task assigned: DB schema" },
      { time: "14:33:12", type: "info", msg: "Creating schema.prisma..." },
      { time: "14:34:50", type: "success", msg: "Schema complete. 5 models created." },
      { time: "14:34:52", type: "success", msg: "Task T2 complete. Notifying master." },
      { time: "14:35:00", type: "info", msg: "Waiting for next task..." },
    ],
  },
  {
    id: "claude-opus",
    name: "Claude Opus 4 #2",
    role: "WORKER",
    icon: "🟣",
    status: "running",
    branch: "feat/auth",
    quota: 60,
    quotaUsed: 11.4,
    quotaTotal: 18,
    color: "#8b5cf6",
    logs: [
      { time: "14:33:00", type: "info", msg: "Task: JWT authentication system" },
      { time: "14:33:08", type: "info", msg: "Setting up bcrypt & jsonwebtoken..." },
      { time: "14:33:30", type: "info", msg: "Creating auth middleware..." },
      { time: "14:34:10", type: "info", msg: "Building /auth/register endpoint" },
      { time: "14:35:20", type: "info", msg: "Building /auth/login endpoint" },
      { time: "14:36:00", type: "info", msg: "Adding token refresh logic..." },
    ],
  },
  {
    id: "haiku",
    name: "Claude Haiku 3.5",
    role: "WORKER",
    icon: "🟣",
    status: "done",
    branch: "feat/project-structure",
    quota: 90,
    quotaUsed: 5.2,
    quotaTotal: 18,
    color: "#a78bfa",
    logs: [
      { time: "14:32:10", type: "info", msg: "Task: Setup project & monorepo" },
      { time: "14:32:18", type: "info", msg: "Initializing pnpm workspace..." },
      { time: "14:32:45", type: "info", msg: "Creating packages: api, web, db" },
      { time: "14:33:20", type: "info", msg: "Setting up tsconfig.json files..." },
      { time: "14:33:58", type: "success", msg: "Task complete ✓" },
      { time: "14:34:01", type: "success", msg: "PR #11 opened → feat/project-structure" },
      { time: "14:34:10", type: "success", msg: "Code review by master: PASSED" },
      { time: "14:34:12", type: "success", msg: "Merged into main ✓" },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  orchestrating: "#8b5cf6",
  running: "#f59e0b",
  idle: "#4b5563",
  done: "#4ade80",
};

const STATUS_LABELS: Record<string, string> = {
  orchestrating: "Orchestrating",
  running: "Working",
  idle: "Idle",
  done: "Done",
};

const LOG_COLORS: Record<string, string> = {
  info: "#6b7280",
  success: "#4ade80",
  warning: "#f59e0b",
  error: "#f87171",
};

export function Monitor() {
  const [selected, setSelected] = useState("gemini-1");
  const [devMode, setDevMode] = useState(true);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"agents" | "usage">("agents");

  const agent = AGENTS.find((a) => a.id === selected)!;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 100%)",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "#1e2035", background: "#0d0d1a" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            ♦
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: "#c4b5fd" }}>
            OrchestAI
          </span>
          <span className="text-xs" style={{ color: "#374151" }}>
            /
          </span>
          <span className="text-xs" style={{ color: "#9ca3af" }}>
            Task Manager App
          </span>
          <span className="text-xs" style={{ color: "#374151" }}>
            /
          </span>
          <span className="text-xs" style={{ color: "#6366f1" }}>
            Monitor
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Dev Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#6b7280" }}>
              Developer Mode
            </span>
            <button
              onClick={() => setDevMode(!devMode)}
              className="w-10 h-5 rounded-full flex items-center px-0.5 transition-all"
              style={{ background: devMode ? "#6366f1" : "#1e2035" }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white transition-all"
                style={{ marginLeft: devMode ? "auto" : "0" }}
              />
            </button>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "#1e2035", color: "#9ca3af" }}
          >
            ← Back to Board
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 px-6 py-2 border-b"
        style={{ borderColor: "#1e2035", background: "#090912" }}
      >
        <button
          onClick={() => setTab("agents")}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            background: tab === "agents" ? "#1e1b4b" : "transparent",
            color: tab === "agents" ? "#a5b4fc" : "#6b7280",
          }}
        >
          Agent Terminals
        </button>
        <button
          onClick={() => setTab("usage")}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            background: tab === "usage" ? "#1e1b4b" : "transparent",
            color: tab === "usage" ? "#a5b4fc" : "#6b7280",
          }}
        >
          Usage &amp; Quotas
        </button>
      </div>

      {tab === "usage" ? (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-base font-bold mb-1" style={{ color: "#e2e8f0" }}>
                API Usage &amp; Quotas
              </h2>
              <p className="text-xs" style={{ color: "#6b7280" }}>
                Live quota tracking per agent — similar to OpenUsage
              </p>
            </div>
            <div className="space-y-3">
              {AGENTS.map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl p-4 border"
                  style={{ background: "#111120", borderColor: "#1e2035" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{a.icon}</span>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                          {a.name}
                        </div>
                        <div className="text-xs" style={{ color: "#6b7280" }}>
                          {a.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: a.color }}>
                        {a.quota}%
                      </div>
                      <div className="text-xs" style={{ color: "#6b7280" }}>
                        remaining
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden mb-2"
                    style={{ background: "#1e2035" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${100 - a.quota}%`,
                        background: a.quota > 50 ? a.color : a.quota > 20 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "#4b5563" }}>
                    <span>Used: {a.quotaUsed}M tokens</span>
                    <span>Limit: {a.quotaTotal}M tokens / day</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Agent List */}
          <div
            className="w-56 border-r flex flex-col"
            style={{ borderColor: "#1e2035", background: "#090912" }}
          >
            <div className="px-4 pt-4 pb-2">
              <div
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#6366f1" }}
              >
                Active Agents
              </div>
            </div>
            <ScrollArea className="flex-1 px-3 pb-4">
              <div className="space-y-1.5">
                {AGENTS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a.id)}
                    className="w-full rounded-xl p-3 text-left border transition-all"
                    style={{
                      background: selected === a.id ? "#151530" : "transparent",
                      borderColor: selected === a.id ? "#6366f1" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium truncate"
                          style={{ color: "#d1d5db" }}
                        >
                          {a.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: STATUS_COLORS[a.status] }}
                      />
                      <span className="text-xs" style={{ color: STATUS_COLORS[a.status] }}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </div>
                    <div
                      className="text-xs font-mono mt-1 truncate"
                      style={{ color: "#374151" }}
                    >
                      {a.branch}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Terminal Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Agent header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: "#1e2035" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{agent.icon}</span>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
                    {agent.name}
                  </div>
                  <div className="text-xs flex items-center gap-2" style={{ color: "#6b7280" }}>
                    <span>{agent.role}</span>
                    <span>·</span>
                    <span className="font-mono" style={{ color: "#a5b4fc" }}>
                      {agent.branch}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                  style={{
                    background: STATUS_COLORS[agent.status] + "15",
                    color: STATUS_COLORS[agent.status],
                    border: `1px solid ${STATUS_COLORS[agent.status]}40`,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_COLORS[agent.status] }}
                  />
                  {STATUS_LABELS[agent.status]}
                </div>
              </div>
            </div>

            {/* Terminal Output */}
            <div
              className="flex-1 overflow-hidden flex flex-col"
              style={{ background: "#050508" }}
            >
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-1 font-mono text-xs">
                  {agent.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span style={{ color: "#374151", flexShrink: 0 }}>
                        {log.time}
                      </span>
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                        style={{ background: LOG_COLORS[log.type] }}
                      />
                      <span style={{ color: LOG_COLORS[log.type] }}>{log.msg}</span>
                    </div>
                  ))}
                  {agent.status === "running" && (
                    <div className="flex items-center gap-3 mt-2">
                      <span style={{ color: "#374151" }}>{new Date().toLocaleTimeString()}</span>
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full"
                        style={{ background: "#f59e0b" }}
                      />
                      <span style={{ color: "#f59e0b" }}>
                        <span
                          className="inline-block"
                          style={{ animation: "pulse 1s infinite" }}
                        >
                          ▋
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Developer Mode Input */}
              {devMode && (
                <div
                  className="border-t px-4 py-3"
                  style={{ borderColor: "#1e2035" }}
                >
                  <div className="text-xs mb-2" style={{ color: "#6b7280" }}>
                    Developer Mode — inject prompt to {agent.name}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a prompt or instruction..."
                      className="flex-1 rounded-lg px-3 py-2 text-xs font-mono"
                      style={{
                        background: "#111120",
                        border: "1px solid #2a2a45",
                        color: "#e2e8f0",
                        outline: "none",
                      }}
                    />
                    <button
                      className="px-4 py-2 rounded-lg text-xs font-medium"
                      style={{
                        background: input ? "#6366f1" : "#1e2035",
                        color: input ? "#fff" : "#4b5563",
                      }}
                    >
                      Send ↵
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PR & Merge Panel */}
          <div
            className="w-64 border-l flex flex-col"
            style={{ borderColor: "#1e2035", background: "#090912" }}
          >
            <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: "#1e2035" }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6366f1" }}>
                Merge Queue
              </div>
            </div>
            <ScrollArea className="flex-1 px-3 py-3">
              <div className="space-y-2">
                {[
                  {
                    pr: "PR #11",
                    title: "feat/project-structure",
                    agent: "Claude Haiku",
                    icon: "🟣",
                    status: "merged",
                    review: "Master approved",
                  },
                  {
                    pr: "PR #12",
                    title: "feat/db-schema",
                    agent: "Gemini #1",
                    icon: "🔵",
                    status: "ready",
                    review: "Master approved",
                  },
                  {
                    pr: "PR #13",
                    title: "feat/auth (partial)",
                    agent: "Claude Opus #2",
                    icon: "🟣",
                    status: "pending",
                    review: "Awaiting completion",
                  },
                  {
                    pr: "PR #14",
                    title: "feat/api-endpoints",
                    agent: "Gemini #2",
                    icon: "🔵",
                    status: "pending",
                    review: "In progress",
                  },
                ].map((pr, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3 border"
                    style={{
                      background:
                        pr.status === "merged"
                          ? "#071a0e"
                          : pr.status === "ready"
                          ? "#0a0a1e"
                          : "#111120",
                      borderColor:
                        pr.status === "merged"
                          ? "#14532d"
                          : pr.status === "ready"
                          ? "#4338ca"
                          : "#1e2035",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-mono font-bold"
                        style={{
                          color:
                            pr.status === "merged"
                              ? "#4ade80"
                              : pr.status === "ready"
                              ? "#818cf8"
                              : "#6b7280",
                        }}
                      >
                        {pr.pr}
                      </span>
                      <span className="text-xs" style={{ color: "#374151" }}>
                        {pr.icon}
                      </span>
                    </div>
                    <div
                      className="text-xs font-mono mb-1 truncate"
                      style={{ color: "#9ca3af" }}
                    >
                      {pr.title}
                    </div>
                    <div className="text-xs mb-2" style={{ color: "#4b5563" }}>
                      {pr.review}
                    </div>
                    {pr.status === "ready" && (
                      <button
                        className="w-full py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: "#1e1b4b", color: "#818cf8" }}
                      >
                        Merge →
                      </button>
                    )}
                    {pr.status === "merged" && (
                      <div className="text-xs" style={{ color: "#4ade80" }}>
                        ✓ Merged to main
                      </div>
                    )}
                    {pr.status === "pending" && (
                      <div className="text-xs" style={{ color: "#4b5563" }}>
                        ⏳ Not ready yet
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Code Review Section */}
            <div
              className="border-t px-4 py-4"
              style={{ borderColor: "#1e2035" }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "#6366f1" }}
              >
                Master Code Review
              </div>
              <div
                className="rounded-xl p-3 border text-xs mb-3"
                style={{
                  background: "#0a0a1e",
                  borderColor: "#2a2a45",
                  color: "#9ca3af",
                  lineHeight: 1.6,
                }}
              >
                T1 & T2 reviewed. Clean structure, good separation of concerns. Minor: add index to users.email.
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "#052e16", color: "#4ade80" }}
                >
                  ✓ Accept
                </button>
                <button
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "#1e2035", color: "#9ca3af" }}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
