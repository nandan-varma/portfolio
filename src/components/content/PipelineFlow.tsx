import { useEffect, useRef, useState } from "react";

const CAP = 5;
const INTERVAL_MS = 450;

// One lap of the rolling `while (queue.length) await Promise.race(active)`
// loop the orchestrator actually runs: climbs to the swarm-budget cap, holds
// there as finished agents get replaced by freshly-claimed chunks, then
// drains as the queue empties. Six drops per lap == six ingest events.
const CONCURRENCY = [0, 1, 2, 3, 4, 5, 5, 4, 5, 5, 4, 3, 4, 2, 1, 0];
const QUEUE = [22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 11, 9, 7, 5, 2, 0];

function DbIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}

function Connector() {
  return (
    <>
      <div className="hidden shrink-0 items-center px-2 sm:flex">
        <div className="relative h-[2px] w-8 bg-zinc-200">
          <div className="pf-dot-h" />
        </div>
      </div>
      <div className="flex justify-center py-1 sm:hidden">
        <div className="relative h-6 w-[2px] bg-zinc-200">
          <div className="pf-dot-v" />
        </div>
      </div>
    </>
  );
}

export default function PipelineFlow() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  const [ingested, setIngested] = useState(36);
  const [flashKey, setFlashKey] = useState(0);
  const prevConcurrency = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const idx = tick % CONCURRENCY.length;
  const concurrency = CONCURRENCY[idx];
  const queue = QUEUE[idx];

  useEffect(() => {
    if (concurrency < prevConcurrency.current) {
      setIngested((n) => n + 1);
      setFlashKey((k) => k + 1);
    }
    prevConcurrency.current = concurrency;
  }, [concurrency]);

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Live swarm
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="pf-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          running
        </span>
      </div>
      <p className="mb-6 text-xs leading-relaxed text-zinc-500">
        No fixed worker count — the orchestrator runs one rolling loop,
        claiming the next chunk off the queue and launching a fresh judge the
        instant a slot opens, up to the swarm budget.
      </p>

      <div
        className="flex flex-col gap-1 sm:flex-row sm:items-stretch transition-all duration-500 ease-out"
        style={{ opacity: mounted ? 1 : 0, transform: `translateY(${mounted ? 0 : 10}px)` }}
      >
        <div className="flex flex-1 flex-col items-center gap-2.5 rounded-xl border border-zinc-200 p-4">
          <span className="text-sm font-semibold text-zinc-900">Orchestrator</span>
          <span className="text-[11px] text-zinc-500">
            queue: <span className="font-semibold tabular-nums text-zinc-700">{queue}</span>{" "}
            chunks left
          </span>
          <div className="flex flex-wrap justify-center gap-1.5 py-1">
            {Array.from({ length: CAP }).map((_, i) => {
              const active = i < concurrency;
              return (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full transition-all duration-300 ease-out"
                  style={{
                    background: active ? "#6366f1" : "transparent",
                    border: active ? "none" : "1.5px solid #d4d4d8",
                    transform: active ? "scale(1)" : "scale(0.8)",
                    boxShadow: active ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                  }}
                />
              );
            })}
          </div>
          <span className="text-[11px] font-semibold text-indigo-600">
            {concurrency}/{CAP} judges in flight
          </span>
        </div>

        <Connector />

        <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-zinc-200 p-4">
          <span className="text-sm font-semibold text-zinc-900">Ingest</span>
          <span className="text-[11px] text-zinc-500">merge verdicts → upsert</span>
          <div
            key={flashKey}
            className="pf-db-flash flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500"
          >
            <DbIcon className="h-4.5 w-4.5" />
          </div>
          <span className="font-mono text-[10px] text-zinc-400">
            ingest.py · idempotent
          </span>
        </div>

        <Connector />

        <div className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-zinc-200 p-4">
          <span className="text-sm font-semibold text-zinc-900">Dashboard</span>
          <span className="text-2xl font-bold tabular-nums text-zinc-900 sm:text-3xl">
            {ingested}
          </span>
          <span className="text-[11px] text-zinc-500">eligible roles, live</span>
          <span className="text-[10px] font-semibold text-teal-600">
            reads Turso · ≤10s stale
          </span>
        </div>
      </div>

      <style>{`
        .pf-dot-h {
          position: absolute; top: 50%; width: 6px; height: 6px;
          border-radius: 9999px; background: #6366f1;
          transform: translate(-50%, -50%);
          animation: pf-flow-x 1.8s linear infinite;
        }
        @keyframes pf-flow-x {
          0% { left: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        .pf-dot-v {
          position: absolute; left: 50%; width: 6px; height: 6px;
          border-radius: 9999px; background: #6366f1;
          transform: translate(-50%, -50%);
          animation: pf-flow-y 1.8s linear infinite;
        }
        @keyframes pf-flow-y {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .pf-db-flash { animation: pf-db-pulse 600ms ease-out; }
        @keyframes pf-db-pulse {
          0% { background: #6366f1; color: #ffffff; transform: scale(1.18); }
          100% { background: #f4f4f5; color: #71717a; transform: scale(1); }
        }
        .pf-ping { animation: pf-ping-anim 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75; }
        @keyframes pf-ping-anim {
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
