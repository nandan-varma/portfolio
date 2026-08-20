import { useEffect, useState } from "react";
import { useCountUp } from "./useCountUp";

// Real numbers, pulled from the job-fetcher Turso DB, resumedb, sites.json,
// and Pi's own session records (17 main sessions + 2,150 subagent transcripts)
// on 2026-08-19/20.
const ROWS = [
  { label: "postings ingested", target: 45419 },
  { label: "career sites wired up", target: 144 },
  { label: "eligible roles right now", target: 2394 },
  { label: "resumes written", target: 2078 },
  { label: "subagent runs", target: 2150 },
] as const;

function StatRow({ label, target, mounted }: { label: string; target: number; mounted: boolean }) {
  const value = useCountUp(target, mounted, 1100);
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold tabular-nums text-zinc-900">
        {Math.round(value).toLocaleString()}
      </span>
    </div>
  );
}

export default function RunStats() {
  const [mounted, setMounted] = useState(false);
  const tokens = useCountUp(3.89, mounted, 1300);
  const cacheShare = useCountUp(95, mounted, 1300);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        The receipt
      </div>
      <p className="mb-6 text-xs leading-relaxed text-zinc-500">
        August 14 to August 19. Five days, pulled straight from the run logs,
        not rounded for effect.
      </p>

      <div
        className="divide-y divide-dashed divide-zinc-200 font-mono text-xs transition-all duration-500 ease-out"
        style={{ opacity: mounted ? 1 : 0, transform: `translateY(${mounted ? 0 : 8}px)` }}
      >
        {ROWS.map((row) => (
          <StatRow key={row.label} label={row.label} target={row.target} mounted={mounted} />
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-zinc-50 p-4 font-mono sm:p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-zinc-900">tokens burned</span>
          <span className="text-2xl font-bold tabular-nums text-emerald-600 sm:text-3xl">
            {tokens.toFixed(2)}B
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between text-xs">
          <span className="text-zinc-400">of which cached context re-reads</span>
          <span className="font-semibold tabular-nums text-zinc-500">
            ~{Math.round(cacheShare)}%
          </span>
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-400">
        Across 17 main orchestrator sessions and 2,150 subagent runs. Almost
        all of it is cached context bought back at a steep discount, and lean
        agents (no inherited context, thinking off) keep most of the swarm off
        the expensive path entirely.
      </p>
    </div>
  );
}
