import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const AGENTS = [
  {
    id: "claude-opus",
    name: "Claude Opus 4",
    cli: "claude",
    icon: "🟣",
    authenticated: true,
    version: "v1.2.3",
    model: "claude-opus-4-5",
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku 3.5",
    cli: "claude",
    icon: "🟣",
    authenticated: true,
    version: "v1.2.3",
    model: "claude-haiku-3-5",
  },
  {
    id: "gemini",
    name: "Gemini 2.5 Pro",
    cli: "gemini",
    icon: "🔵",
    authenticated: true,
    version: "v0.9.1",
    model: "gemini-2.5-pro",
  },
  {
    id: "codex",
    name: "Codex CLI",
    cli: "codex",
    icon: "⬛",
    authenticated: false,
    version: "v0.1.2504",
    model: "gpt-4o",
  },
  {
    id: "gpt4",
    name: "GPT-4.1",
    cli: "openai",
    icon: "🟢",
    authenticated: false,
    version: null,
    model: null,
  },
];

type Agent = typeof AGENTS[0];

export function Setup() {
  const [master, setMaster] = useState<string | null>("claude-opus");
  const [workers, setWorkers] = useState<Record<string, number>>({
    gemini: 2,
    "claude-haiku": 1,
  });
  const [task, setTask] = useState(
    "Build a full-stack task management app with React frontend and Node.js API. Include user auth, CRUD for tasks, real-time updates, and responsive mobile design."
  );

  const toggleWorker = (id: string) => {
    if (!AGENTS.find((a) => a.id === id)?.authenticated) return;
    setWorkers((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const changeCount = (id: string, delta: number) => {
    setWorkers((prev) => {
      const next = Math.max(1, Math.min(4, (prev[id] || 1) + delta));
      return { ...prev, [id]: next };
    });
  };

  const totalWorkers = Object.values(workers).reduce((a, b) => a + b, 0);
  const masterAgent = AGENTS.find((a) => a.id === master);

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
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            ♦
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: "#c4b5fd" }}>
            OrchestAI
          </span>
          <span className="text-xs ml-1" style={{ color: "#4b5563" }}>
            v0.9.1
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: "#6b7280" }}>
          <span className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#22c55e" }}
            />
            5 agents found
          </span>
          <span>Usage</span>
          <span>Settings</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Agent Discovery */}
        <div
          className="w-72 flex flex-col border-r"
          style={{ borderColor: "#1e2035", background: "#090912" }}
        >
          <div className="px-4 pt-5 pb-3">
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#6366f1" }}>
              Discovered Agents
            </div>
            <div className="text-xs" style={{ color: "#4b5563" }}>
              Scanning ~/.config for CLI tools…
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 pb-4">
            <div className="space-y-2">
              {AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl p-3 border transition-all"
                  style={{
                    background: !agent.authenticated ? "#0d0d1a" : "#111120",
                    borderColor: master === agent.id ? "#6366f1" : "#1e2035",
                    opacity: !agent.authenticated ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{agent.icon}</span>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                          {agent.name}
                        </div>
                        <div className="text-xs" style={{ color: "#4b5563" }}>
                          {agent.version ?? "not installed"}
                        </div>
                      </div>
                    </div>
                    {agent.authenticated ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "#052e16", color: "#4ade80" }}
                      >
                        ✓ Auth
                      </span>
                    ) : (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "#1a0a00", color: "#f97316" }}
                      >
                        Need Auth
                      </span>
                    )}
                  </div>
                  {agent.authenticated ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setMaster(agent.id)}
                        className="flex-1 py-1 rounded-md text-xs font-medium transition-all"
                        style={{
                          background: master === agent.id ? "#6366f1" : "#1a1a2e",
                          color: master === agent.id ? "#fff" : "#8b8fa8",
                          border: master === agent.id ? "none" : "1px solid #2a2a45",
                        }}
                      >
                        {master === agent.id ? "★ Master" : "Set Master"}
                      </button>
                      <button
                        onClick={() => toggleWorker(agent.id)}
                        className="flex-1 py-1 rounded-md text-xs font-medium transition-all"
                        style={{
                          background: workers[agent.id] ? "#1e1b4b" : "#1a1a2e",
                          color: workers[agent.id] ? "#a5b4fc" : "#8b8fa8",
                          border: workers[agent.id] ? "1px solid #4338ca" : "1px solid #2a2a45",
                        }}
                      >
                        {workers[agent.id] ? `Worker ×${workers[agent.id]}` : "+ Worker"}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-full py-1 rounded-md text-xs font-medium"
                      style={{
                        background: "#1a1010",
                        color: "#f97316",
                        border: "1px solid #3a1a00",
                      }}
                    >
                      Login to use →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center: Config */}
        <div className="flex-1 flex flex-col px-8 py-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-1" style={{ color: "#e2e8f0" }}>
              New Orchestration
            </h1>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              Configure your master conductor and worker agents, then describe your task.
            </p>
          </div>

          {/* Task Input */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#6366f1" }}>
              Task Description
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full rounded-xl p-4 text-sm resize-none leading-relaxed"
              rows={4}
              style={{
                background: "#111120",
                border: "1px solid #2a2a45",
                color: "#e2e8f0",
                outline: "none",
              }}
            />
          </div>

          {/* Master Agent */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: "#6366f1" }}>
              Conductor (Master Agent)
            </label>
            {masterAgent ? (
              <div
                className="rounded-xl p-4 border flex items-center gap-4"
                style={{ background: "#111120", borderColor: "#4338ca" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "linear-gradient(135deg, #4338ca, #7c3aed)" }}
                >
                  {masterAgent.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: "#e2e8f0" }}>
                    {masterAgent.name}
                  </div>
                  <div className="text-xs" style={{ color: "#6b7280" }}>
                    {masterAgent.model} · {masterAgent.version}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#a5b4fc" }}>
                    Will decompose tasks and orchestrate all workers
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#1e1b4b", color: "#818cf8" }}
                >
                  CONDUCTOR
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl p-4 border text-sm"
                style={{ background: "#0d0d1a", borderColor: "#2a2a45", color: "#4b5563" }}
              >
                ← Select a master agent from the list
              </div>
            )}
          </div>

          {/* Workers */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6366f1" }}>
                Worker Agents
              </label>
              {totalWorkers > 0 && (
                <span className="text-xs" style={{ color: "#6b7280" }}>
                  {totalWorkers} total instances
                </span>
              )}
            </div>

            {Object.keys(workers).length === 0 ? (
              <div
                className="rounded-xl p-4 border text-sm"
                style={{ background: "#0d0d1a", borderColor: "#2a2a45", color: "#4b5563" }}
              >
                ← Select workers from the list
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(workers).map(([id, count]) => {
                  const agent = AGENTS.find((a) => a.id === id)!;
                  return (
                    <div
                      key={id}
                      className="rounded-xl p-3 border flex items-center gap-3"
                      style={{ background: "#111120", borderColor: "#2a2a45" }}
                    >
                      <span className="text-lg">{agent.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                          {agent.name}
                        </div>
                        <div className="text-xs" style={{ color: "#6b7280" }}>
                          {agent.model}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeCount(id, -1)}
                          className="w-6 h-6 rounded-md text-xs flex items-center justify-center"
                          style={{ background: "#1e2035", color: "#9ca3af" }}
                        >
                          −
                        </button>
                        <span
                          className="w-8 text-center text-sm font-bold"
                          style={{ color: "#e2e8f0" }}
                        >
                          ×{count}
                        </span>
                        <button
                          onClick={() => changeCount(id, 1)}
                          className="w-6 h-6 rounded-md text-xs flex items-center justify-center"
                          style={{ background: "#1e2035", color: "#9ca3af" }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => toggleWorker(id)}
                          className="ml-1 text-xs"
                          style={{ color: "#4b5563" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Launch */}
          <button
            className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all"
            style={{
              background:
                master && totalWorkers > 0
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#1e2035",
              color: master && totalWorkers > 0 ? "#fff" : "#4b5563",
              cursor: master && totalWorkers > 0 ? "pointer" : "not-allowed",
            }}
          >
            {master && totalWorkers > 0
              ? `▶ Launch Orchestra (1 conductor + ${totalWorkers} workers)`
              : "Select master & workers to launch"}
          </button>
        </div>

        {/* Right Panel: Summary */}
        <div
          className="w-64 border-l flex flex-col"
          style={{ borderColor: "#1e2035", background: "#090912" }}
        >
          <div className="px-4 pt-5 pb-3">
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6366f1" }}>
              Orchestra Summary
            </div>
          </div>

          <div className="flex-1 px-4 space-y-4">
            {/* Worktrees info */}
            <div
              className="rounded-xl p-3 border"
              style={{ background: "#111120", borderColor: "#1e2035" }}
            >
              <div className="text-xs font-medium mb-2" style={{ color: "#9ca3af" }}>
                Git Worktrees
              </div>
              <div className="space-y-1">
                {Object.entries(workers).flatMap(([id, count]) => {
                  const agent = AGENTS.find((a) => a.id === id)!;
                  return Array.from({ length: count }, (_, i) => (
                    <div key={`${id}-${i}`} className="flex items-center gap-1.5 text-xs" style={{ color: "#6b7280" }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#4338ca" }}
                      />
                      {agent.cli}-worker-{i + 1}
                    </div>
                  ));
                })}
                {totalWorkers === 0 && (
                  <div className="text-xs" style={{ color: "#374151" }}>
                    No workers selected
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div
              className="rounded-xl p-3 border"
              style={{ background: "#111120", borderColor: "#1e2035" }}
            >
              <div className="text-xs font-medium mb-3" style={{ color: "#9ca3af" }}>
                Settings
              </div>
              <div className="space-y-3">
                {[
                  { label: "Developer Mode", on: false },
                  { label: "Auto Merge", on: false },
                  { label: "Auto PR", on: true },
                  { label: "Code Review", on: true },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#9ca3af" }}>
                      {setting.label}
                    </span>
                    <div
                      className="w-8 h-4 rounded-full flex items-center px-0.5"
                      style={{
                        background: setting.on ? "#4338ca" : "#1e2035",
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full transition-all"
                        style={{
                          background: "#fff",
                          marginLeft: setting.on ? "auto" : "0",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-3 border"
              style={{ background: "#111120", borderColor: "#1e2035" }}
            >
              <div className="text-xs font-medium mb-2" style={{ color: "#9ca3af" }}>
                Estimated Resources
              </div>
              <div className="space-y-1.5 text-xs" style={{ color: "#6b7280" }}>
                <div className="flex justify-between">
                  <span>Workers</span>
                  <span style={{ color: "#a5b4fc" }}>{totalWorkers} instances</span>
                </div>
                <div className="flex justify-between">
                  <span>Worktrees</span>
                  <span style={{ color: "#a5b4fc" }}>{totalWorkers} branches</span>
                </div>
                <div className="flex justify-between">
                  <span>PRs</span>
                  <span style={{ color: "#a5b4fc" }}>~{totalWorkers} expected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
