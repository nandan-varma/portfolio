import { useEffect, useState } from "react";

const TOOL_META = {
  browser: { label: "+ browser", color: "#f97316" },
  compile: { label: "+ bash", color: "#14b8a6" },
  terminal: { label: "read/write", color: "#6366f1" },
} as const;

const THINK_COLOR = { off: "#a1a1aa", low: "#6366f1", high: "#ef4444" } as const;
const CTX_COLOR = { fresh: "#22c55e", inherited: "#f59e0b" } as const;

// Per-type instance counts, one column per animation frame. Hand-scripted
// from the real swarm budget: a browser wave (Chrome-bound, cap 2) never
// overlaps a judge wave (LLM-only, judges share a 5-slot budget), verdict-writer
// only spikes for the rare judgment-heavy stragglers, resume-builder trails
// last (xelatex, cap 3) — and the column sum never exceeds the hard ceiling
// of 6 in flight, same as a real run.
const AGENTS = [
  {
    id: "browser-sweeper",
    label: "browser-sweeper",
    task: "drives a real Chrome tab on Meta & Uber careers pages",
    thinking: "high",
    context: "inherited",
    tools: "browser",
    cap: 2,
    frames: [1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "title-triage",
    label: "title-triage",
    task: "engineering yes/no across 500–1000 titles a pass",
    thinking: "off",
    context: "fresh",
    tools: "terminal",
    cap: 5,
    frames: [0, 0, 0, 0, 0, 1, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "review-writer",
    label: "review-writer",
    task: "CS-gate + eligibility + fit, one ~150-role chunk",
    thinking: "low",
    context: "fresh",
    tools: "terminal",
    cap: 5,
    frames: [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "verdict-writer",
    label: "verdict-writer",
    task: "judgment-heavy eligibility calls, full project context",
    thinking: "high",
    context: "inherited",
    tools: "terminal",
    cap: 2,
    frames: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "resume-builder",
    label: "resume-builder",
    task: "profile + JD → .tex → xelatex → verified PDF",
    thinking: "low",
    context: "fresh",
    tools: "compile",
    cap: 3,
    frames: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 1, 1, 0, 0],
  },
] as const;

const FRAME_COUNT = AGENTS[0].frames.length;
const STEP_MS = 380;

export default function AgentRoster() {
  const [mounted, setMounted] = useState(false);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAME_COUNT), STEP_MS);
    return () => clearInterval(id);
  }, []);

  const counts = AGENTS.map((a) => a.frames[frame]);
  const totalInFlight = counts.reduce((a, b) => a + b, 0);
  const activeAgents = AGENTS.filter((a, i) => counts[i] > 0);

  const hubLabel =
    activeAgents.length === 0
      ? "idle, nothing queued right now"
      : activeAgents
          .map((a) => `${a.label} ×${a.frames[frame]}`)
          .join("  ·  ");

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        The roster
      </div>
      <p className="mb-6 text-xs leading-relaxed text-zinc-500">
        Not one worker type, and not one at a time. The orchestrator boots
        however many of whichever kind the backlog in front of it calls for,
        several types running at once, scaling each up or down independently.
      </p>

      <div
        className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition-all duration-500 ease-out"
        style={{ opacity: mounted ? 1 : 0, transform: `translateY(${mounted ? 0 : 8}px)` }}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            {totalInFlight > 0 && (
              <span className="pf-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400" />
            )}
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ background: totalInFlight > 0 ? "#6366f1" : "#a1a1aa" }}
            />
          </span>
          <span className="text-xs font-semibold text-zinc-900">Orchestrator</span>
          <span className="ml-auto shrink-0 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white">
            {totalInFlight}/6 in flight
          </span>
        </div>
        {/* fixed-height, line-clamped: the label's length changes every frame,
            reserving 2 lines up front keeps the card from reflowing the grid below */}
        <p className="mt-1.5 line-clamp-2 min-h-[28px] font-mono text-[11px] leading-snug text-zinc-600">
          {hubLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {AGENTS.map((agent, i) => {
          const count = counts[i];
          const isActive = count > 0;
          const tool = TOOL_META[agent.tools as keyof typeof TOOL_META];
          return (
            <div
              key={agent.id}
              className="relative overflow-hidden rounded-xl border p-3 transition-all duration-300 ease-out"
              style={{
                opacity: mounted ? (isActive ? 1 : 0.5) : 0,
                transform: `translateY(${mounted ? 0 : 8}px) scale(${isActive ? 1.03 : 1})`,
                transitionDelay: mounted ? "0ms" : `${i * 90}ms`,
                borderColor: isActive ? "#818cf8" : "#e4e4e7",
                boxShadow: isActive ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[11px] font-semibold leading-tight text-zinc-900">
                  {agent.label}
                </span>
                <span
                  key={count}
                  className="ar-count-pop shrink-0 rounded-full px-1.5 text-[10px] font-bold tabular-nums text-white"
                  style={{ background: isActive ? "#6366f1" : "#d4d4d8" }}
                >
                  {count}
                </span>
              </div>
              <div className="mt-1 text-[10px] leading-snug text-zinc-500">
                {agent.task}
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white"
                  style={{ background: THINK_COLOR[agent.thinking as keyof typeof THINK_COLOR] }}
                >
                  thinking: {agent.thinking}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white"
                  style={{ background: CTX_COLOR[agent.context as keyof typeof CTX_COLOR] }}
                >
                  {agent.context}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white"
                  style={{ background: tool.color }}
                >
                  {tool.label}
                </span>
              </div>

              <div className="mt-2.5 flex gap-1">
                {Array.from({ length: agent.cap }).map((_, slot) => {
                  const filled = slot < count;
                  return (
                    <span
                      key={slot}
                      className="h-2 flex-1 rounded-full transition-all duration-300 ease-out"
                      style={{
                        background: filled ? tool.color : "#e4e4e7",
                        transform: filled ? "scaleY(1)" : "scaleY(0.7)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-zinc-100 pt-4 text-[11px] leading-relaxed text-zinc-500">
        Only <span className="font-mono text-zinc-700">browser-sweeper</span>{" "}
        loads the CDP browser extension at all. Every other agent physically
        cannot open a tab. And it never runs alongside a judge wave: Chrome is
        RAM-bound, judges are token-bound, so the orchestrator keeps them off
        the clock at the same time on purpose.
      </p>

      <style>{`
        .pf-ping { animation: ar-ping-anim 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75; }
        @keyframes ar-ping-anim {
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
        .ar-count-pop { animation: ar-pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes ar-pop {
          0% { transform: scale(1.6); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
