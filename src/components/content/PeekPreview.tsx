import { useEffect, useState } from "react";
import { PeekIcon } from "@/components/content/BrowserIcons";

function FakeWindow({
  className = "",
  accent,
}: {
  className?: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 bg-white shadow-md ${className}`}
    >
      <div className="flex items-center gap-1.5 rounded-t-lg border-b border-zinc-100 bg-zinc-50 px-2.5 py-2">
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
      </div>
      <div className="space-y-2 p-3">
        <div className="h-2 w-3/4 rounded-full" style={{ background: accent }} />
        <div className="h-2 w-1/2 rounded-full bg-zinc-200" />
        <div className="h-2 w-2/3 rounded-full bg-zinc-200" />
      </div>
    </div>
  );
}

export default function PeekPreview() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        Peek, pinned on top
      </div>

      <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-zinc-100">
        <FakeWindow
          accent="#d4d4d8"
          className="absolute left-[5%] top-[10%] w-[44%] rotate-[-2deg] opacity-90"
        />
        <FakeWindow
          accent="#FB542B55"
          className="absolute left-[14%] top-[42%] w-[48%] rotate-[1.5deg]"
        />

        <div
          className="absolute right-[5%] top-1/2 flex w-[30%] min-w-[124px] flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-2xl transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-700"
          style={{
            opacity: mounted ? 1 : 0,
            transform: `translateY(${mounted ? "-50%" : "calc(-50% + 18px)"}) scale(${mounted ? 1 : 0.88})`,
          }}
        >
          <div className="flex items-center justify-between gap-1 border-b border-indigo-50 bg-indigo-50/60 px-2.5 py-2">
            <span className="flex items-center gap-1.5">
              <PeekIcon className="h-5 w-5 rounded-lg" />
              <span className="text-[10px] font-semibold text-indigo-700">
                Peek
              </span>
            </span>
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </span>
          </div>
          <div className="space-y-2 p-3">
            <div className="h-2 w-4/5 rounded-full bg-indigo-200" />
            <div className="h-2 w-3/5 rounded-full bg-indigo-100" />
            <div className="mt-2.5 flex h-12 items-end gap-1 rounded-md bg-indigo-50 p-1.5">
              <span className="h-[40%] w-1/5 rounded-sm bg-indigo-300" />
              <span className="h-[70%] w-1/5 rounded-sm bg-indigo-400" />
              <span className="h-[50%] w-1/5 rounded-sm bg-indigo-300" />
              <span className="h-[90%] w-1/5 rounded-sm bg-indigo-500" />
              <span className="h-[65%] w-1/5 rounded-sm bg-indigo-400" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-indigo-50 bg-indigo-50/40 px-2.5 py-1.5">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-indigo-400"
              style={{
                animation: mounted ? "spin 5s linear infinite" : undefined,
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v5h-5" />
            </svg>
            <span className="text-[9px] font-medium text-indigo-400">
              always on top
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
