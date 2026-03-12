import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const TASKS = [
  {
    id: "T1",
    title: "Setup project structure & monorepo config",
    agent: "claude-haiku",
    agentName: "Claude Haiku",
    agentIcon: "🟣",
    status: "done",
    branch: "feat/project-structure",
    duration: "2m 14s",
  },
  {
    id: "T2",
    title: "Design database schema (users, tasks, sessions)",
    agent: "gemini-1",
    agentName: "Gemini Pro #1",
    agentIcon: "🔵",
    status: "done",
    branch: "feat/db-schema",
    duration: "3m 02s",
  },
  {
    id: "T3",
    title: "Build REST API endpoints for task CRUD",
    agent: "gemini-2",
    agentName: "Gemini Pro #2",
    agentIcon: "🔵",
    status: "in_progress",
    branch: "feat/api-endpoints",
    duration: "1m 47s",
    progress: 68,
  },
  {
    id: "T4",
    title: "Implement JWT authentication & user registration",
    agent: "claude-opus",
    agentName: "Claude Opus",
    agentIcon: "🟣",
    status: "in_progress",
    branch: "feat/auth",
    duration: "2m 33s",
    progress: 45,
  },
  {
    id: "T5",
    title: "React frontend: task list & kanban board UI",
    agent: "gemini-1",
    agentName: "Gemini Pro #1",
    agentIcon: "🔵",
    status: "waiting",
    branch: "feat/frontend-ui",
    duration: null,
  },
  {
    id: "T6",
    title: "Real-time WebSocket updates",
    agent: "gemini-2",
    agentName: "Gemini Pro #2",
    agentIcon: "🔵",
    status: "waiting",
    branch: "feat/realtime",
    duration: null,
  },
  {
    id: "T7",
    title: "Mobile responsive design & PWA manifest",
    agent: "claude-haiku",
    agentName: "Claude Haiku",
    agentIcon: "🟣",
    status: "waiting",
    branch: "feat/mobile",
    duration: null,
  },
  {
    id: "T8",
    title: "End-to-end testing & CI pipeline",
    agent: "claude-opus",
    agentName: "Claude Opus (Master)",
    agentIcon: "🟣",
    status: "waiting",
    branch: "feat/testing",
    duration: null,
  },
];

const STATUS_COLORS: Record<string, string> = {
  done: "#4ade80",
  in_progress: "#f59e0b",
  waiting: "#4b5563",
  review: "#818cf8",
};

const STATUS_BG: Record<string, string> = {
  done: "#052e16",
  in_progress: "#1c1000",
  waiting: "#111120",
  review: "#1e1b4b",
};

const STATUS_LABEL: Record<string, string> = {
  done: "Done",
  in_progress: "In Progress",
  waiting: "Queued",
  review: "Review",
};

const COLUMNS = ["waiting", "in_progress", "done", "review"];
const COLUMN_LABELS: Record<string, string> = {
  waiting: "Queued",
  in_progress: "In Progress",
  done: "Done",
  review: "Review",
};

export function Orchestration() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [selectedTask, setSelectedTask] = useState<string | null>("T3");

  const selected = TASKS.find((t) => t.id === selectedTask);
  const doneCount = TASKS.filter((t) => t.status === "done").length;
  const total = TASKS.length;

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
          <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>
            Task Manager App
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "#1c1000", color: "#f59e0b" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#f59e0b", animation: "pulse 1s infinite" }}
            />
            Orchestrating…
          </div>
          <button
            className="text-xs px-2 py-1 rounded-md"
            style={{ background: "#1e2035", color: "#9ca3af" }}
          >
            Pause
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center gap-6 px-6 py-2.5 border-b text-xs"
        style={{ borderColor: "#1e2035", background: "#090912" }}
      >
        <div className="flex items-center gap-1.5" style={{ color: "#9ca3af" }}>
          <span style={{ color: "#4ade80" }}>✓</span>
          <span>{doneCount}/{total} tasks done</span>
        </div>
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: "#1e2035" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${(doneCount / total) * 100}%`,
              background: "linear-gradient(90deg, #6366f1, #4ade80)",
            }}
          />
        </div>
        <div className="flex items-center gap-4" style={{ color: "#6b7280" }}>
          <span>🟣 Claude Opus (conductor)</span>
          <span>🟣 ×2 Haiku</span>
          <span>🔵 ×2 Gemini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setView("kanban")}
            className="px-2.5 py-1 rounded-md text-xs transition-all"
            style={{
              background: view === "kanban" ? "#1e1b4b" : "transparent",
              color: view === "kanban" ? "#a5b4fc" : "#6b7280",
            }}
          >
            ⊞ Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className="px-2.5 py-1 rounded-md text-xs transition-all"
            style={{
              background: view === "list" ? "#1e1b4b" : "transparent",
              color: view === "list" ? "#a5b4fc" : "#6b7280",
            }}
          >
            ≡ List
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {view === "kanban" ? (
            <div className="flex h-full gap-4 p-5 overflow-x-auto">
              {COLUMNS.map((col) => {
                const colTasks = TASKS.filter((t) => t.status === col);
                return (
                  <div key={col} className="flex-shrink-0 w-56">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: STATUS_COLORS[col] }}
                      />
                      <span className="text-xs font-semibold" style={{ color: "#9ca3af" }}>
                        {COLUMN_LABELS[col]}
                      </span>
                      <span
                        className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: "#1e2035", color: "#6b7280" }}
                      >
                        {colTasks.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task.id)}
                          className="rounded-xl p-3 border cursor-pointer transition-all"
                          style={{
                            background: selectedTask === task.id ? "#151530" : STATUS_BG[task.status],
                            borderColor: selectedTask === task.id ? "#6366f1" : "#1e2035",
                          }}
                        >
                          <div className="text-xs font-medium mb-2 leading-snug" style={{ color: "#d1d5db" }}>
                            {task.title}
                          </div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-xs">{task.agentIcon}</span>
                            <span className="text-xs" style={{ color: "#6b7280" }}>
                              {task.agentName}
                            </span>
                          </div>
                          {task.status === "in_progress" && task.progress && (
                            <div>
                              <div
                                className="h-1 rounded-full overflow-hidden"
                                style={{ background: "#1e2035" }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${task.progress}%`,
                                    background: "#f59e0b",
                                  }}
                                />
                              </div>
                              <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
                                {task.progress}% · {task.duration}
                              </div>
                            </div>
                          )}
                          {task.status === "done" && (
                            <div className="text-xs" style={{ color: "#4b5563" }}>
                              ✓ {task.duration}
                            </div>
                          )}
                          <div
                            className="mt-2 text-xs font-mono truncate"
                            style={{ color: "#374151" }}
                          >
                            {task.branch}
                          </div>
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
                {TASKS.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task.id)}
                    className="rounded-xl px-4 py-3 border flex items-center gap-4 cursor-pointer"
                    style={{
                      background: selectedTask === task.id ? "#151530" : "#111120",
                      borderColor: selectedTask === task.id ? "#6366f1" : "#1e2035",
                    }}
                  >
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center flex-shrink-0"
                      style={{
                        background: STATUS_BG[task.status],
                        color: STATUS_COLORS[task.status],
                      }}
                    >
                      {STATUS_LABEL[task.status]}
                    </span>
                    <span className="text-sm flex-1" style={{ color: "#d1d5db" }}>
                      {task.title}
                    </span>
                    <span className="text-xs" style={{ color: "#6b7280" }}>
                      {task.agentIcon} {task.agentName}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "#374151" }}>
                      {task.branch}
                    </span>
                    {task.duration && (
                      <span className="text-xs" style={{ color: "#4b5563" }}>
                        {task.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Right: Task Detail */}
        {selected && (
          <div
            className="w-72 border-l flex flex-col"
            style={{ borderColor: "#1e2035", background: "#090912" }}
          >
            <div className="px-4 pt-5 pb-3 border-b" style={{ borderColor: "#1e2035" }}>
              <div
                className="text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 mb-2"
                style={{
                  background: STATUS_BG[selected.status],
                  color: STATUS_COLORS[selected.status],
                }}
              >
                {STATUS_LABEL[selected.status]}
              </div>
              <div className="text-sm font-semibold leading-snug" style={{ color: "#e2e8f0" }}>
                {selected.title}
              </div>
            </div>
            <div className="flex-1 px-4 py-4 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>
                  Assigned Agent
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{selected.agentIcon}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                      {selected.agentName}
                    </div>
                    <div className="text-xs" style={{ color: "#6b7280" }}>
                      Active · worktree-ready
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>
                  Branch
                </div>
                <div
                  className="rounded-lg px-3 py-2 text-xs font-mono"
                  style={{ background: "#111120", color: "#a5b4fc", border: "1px solid #1e2035" }}
                >
                  {selected.branch}
                </div>
              </div>

              {selected.status === "in_progress" && selected.progress && (
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>
                      Progress
                    </span>
                    <span style={{ color: "#f59e0b" }}>{selected.progress}%</span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "#1e2035" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${selected.progress}%`, background: "#f59e0b" }}
                    />
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#6b7280" }}>
                    Running for {selected.duration}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6366f1" }}>
                  Reassign To
                </div>
                <select
                  className="w-full rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: "#111120",
                    color: "#9ca3af",
                    border: "1px solid #2a2a45",
                    outline: "none",
                  }}
                >
                  <option>Claude Haiku 3.5</option>
                  <option>Gemini Pro #1</option>
                  <option>Gemini Pro #2</option>
                  <option>Claude Opus 4 (master)</option>
                </select>
              </div>

              {selected.status === "done" && (
                <div
                  className="rounded-xl p-3 border"
                  style={{ background: "#052e16", borderColor: "#14532d" }}
                >
                  <div className="text-xs font-medium mb-1" style={{ color: "#4ade80" }}>
                    ✓ Awaiting Merge
                  </div>
                  <div className="text-xs" style={{ color: "#166534" }}>
                    PR #12 opened · Code review passed
                  </div>
                  <button
                    className="w-full mt-2 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "#14532d", color: "#4ade80" }}
                  >
                    Merge PR →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
