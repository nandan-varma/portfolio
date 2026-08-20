import { useEffect, useState } from "react";

const BUDGET = [
  {
    id: "extract",
    label: "Extractors (API)",
    agents: 0,
    note: "no browser, no agents needed",
    color: "#a1a1aa",
  },
  {
    id: "browser",
    label: "Browser sweeps",
    agents: 2,
    note: "each = a full Chrome; RAM-bound",
    color: "#f97316",
  },
  {
    id: "enrich",
    label: "Enrichers",
    agents: 3,
    note: "browser-bound (Chrome ×3)",
    color: "#f97316",
  },
  {
    id: "judge",
    label: "Judges",
    agents: 5,
    note: "LLM-only, long-running",
    color: "#6366f1",
  },
  {
    id: "resume",
    label: "Resume agents",
    agents: 3,
    note: "compile-heavy (xelatex)",
    color: "#14b8a6",
  },
] as const;

const TRACK_MAX = 8;
const CEILING = 6;

export default function SwarmBudget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        Swarm budget
      </div>
      <p className="mb-8 text-xs text-zinc-500">
        Concurrent subagents allowed per stage, RAM- and token-bound.
      </p>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 border-l-2 border-dashed border-red-300 transition-opacity duration-700"
          style={{
            left: `${(CEILING / TRACK_MAX) * 100}%`,
            opacity: mounted ? 1 : 0,
          }}
        >
          <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-red-400">
            hard ceiling: {CEILING}
          </span>
        </div>

        <div className="space-y-4">
          {BUDGET.map((row, i) => (
            <div key={row.id} className="flex items-center gap-3">
              <div className="w-20 shrink-0 text-[11px] font-semibold leading-tight text-zinc-700 sm:w-32 sm:text-xs">
                {row.label}
              </div>
              <div className="relative h-2.5 flex-1 rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: mounted ? `${(row.agents / TRACK_MAX) * 100}%` : "0%",
                    background: row.color,
                    transitionDelay: `${200 + i * 120}ms`,
                  }}
                />
              </div>
              <div className="w-4 shrink-0 text-right text-xs font-semibold text-zinc-900">
                {row.agents}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-1">
        {BUDGET.map((row) => (
          <p key={row.id} className="text-[11px] leading-relaxed text-zinc-400">
            <span className="font-semibold text-zinc-500">{row.label}:</span>{" "}
            {row.note}
          </p>
        ))}
      </div>

      <p className="mt-5 border-t border-zinc-100 pt-4 text-xs leading-relaxed text-zinc-500">
        2026-08-14: a "fan out everything" wave OOM'd a 16 GB machine, since
        every browser-capable subagent owns an ephemeral Chrome (~0.5 to 1.5 GB each).
        Never overlap a browser wave with a full reviewer wave.
      </p>
    </div>
  );
}
