import { useEffect, useState } from "react";
import { useCountUp } from "./useCountUp";

const AGENTS = [
  {
    id: "heavy",
    title: "Heavy agent",
    subtitle: "verdict-writer",
    accent: "#ef4444",
    rows: [
      ["Inherits project context", "yes"],
      ["Thinking", "high"],
      ["Context tax", "~29,000 tok / agent"],
    ],
  },
  {
    id: "lean",
    title: "Lean agent",
    subtitle: "review-writer / title-triage",
    accent: "#22c55e",
    rows: [
      ["Inherits project context", "no"],
      ["Thinking", "low / off"],
      ["Context tax", "~0 tok / agent"],
    ],
  },
] as const;

const OVERHEAD_TOTAL = 1_100_000;

export default function AgentCostCompare() {
  const [mounted, setMounted] = useState(false);
  const overhead = Math.round(useCountUp(OVERHEAD_TOTAL, mounted));

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        Agent economics
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AGENTS.map((agent, i) => (
          <div
            key={agent.id}
            className="rounded-xl border border-zinc-200 p-4 transition-all duration-500 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: `translateY(${mounted ? 0 : 10}px)`,
              transitionDelay: `${i * 150}ms`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: agent.accent }}
              />
              <span className="text-sm font-semibold text-zinc-900">
                {agent.title}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">{agent.subtitle}</span>

            <dl className="mt-3 space-y-1.5">
              {agent.rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[11px]">
                  <dt className="text-zinc-500">{k}</dt>
                  <dd className="font-semibold text-zinc-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-zinc-50 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-2xl font-bold tabular-nums text-zinc-900 sm:text-3xl">
            {overhead.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-zinc-500">
            tokens of pure overhead
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          A 39-agent triage wave on heavy agents, before any of them did the
          actual job.
        </p>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-red-400 transition-all duration-1000 ease-out"
            style={{ width: mounted ? "100%" : "0%" }}
          />
        </div>
      </div>
    </div>
  );
}
