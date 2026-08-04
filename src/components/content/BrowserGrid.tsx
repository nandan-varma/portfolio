import { Fragment, useEffect, useState } from "react";

const ICONS = {
  pin: (
    <path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
  ),
  userCheck: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m17 11 2 2 4-4" />
    </>
  ),
  ghost: (
    <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v10.5a.5.5 0 0 0 .81.4L7 19l2 1.5 3-2 3 2 2-1.5 2.19 1.9a.5.5 0 0 0 .81-.4V10a8 8 0 0 0-8-8Z" />
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  lockOpen: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 7.75-1.5" />
    </>
  ),
} as const;

function Icon({
  path,
  className = "",
}: {
  path: keyof typeof ICONS;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICONS[path]}
    </svg>
  );
}

const CELLS = [
  {
    row: 0,
    col: 0,
    icon: "pin" as const,
    detail: "Always open, signed in.",
    examples: ["Work dashboard", "Personal inbox"],
  },
  {
    row: 0,
    col: 1,
    icon: "briefcase" as const,
    detail: "Open but idle, signed out.",
    examples: ["Docs I'm reading", "A reference tab"],
  },
  {
    row: 1,
    col: 0,
    icon: "userCheck" as const,
    detail: "Rare — a one-off, signed in.",
    examples: ["Quick approval", "A signed-in errand"],
  },
  {
    row: 1,
    col: 1,
    icon: "ghost" as const,
    detail: "Gone by tomorrow.",
    examples: ["A Google search", "A ChatGPT chat", "Weekend directions"],
  },
];

function RotatingLabel({ items, offset }: { items: string[]; offset: number }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length < 2) return;
    let swap: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setVisible(false);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, 220);
    }, 2400 + offset);
    return () => {
      clearInterval(interval);
      clearTimeout(swap);
    };
  }, [items.length, offset]);

  return (
    <span
      className={`block text-sm font-semibold leading-5 text-zinc-900 transition-all duration-200 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
      }`}
    >
      {items[index]}
    </span>
  );
}

export default function BrowserGrid() {
  const [revealed, setRevealed] = useState<number>(0);

  useEffect(() => {
    const timers = CELLS.map((_, i) =>
      setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), 120 * (i + 1)),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        The 2x2
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-2 sm:gap-x-3 sm:gap-y-3">
        <div />
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500">
          <Icon path="lock" className="h-3.5 w-3.5" />
          Logged in
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500">
          <Icon path="lockOpen" className="h-3.5 w-3.5" />
          Logged out
        </div>

        {[0, 1].map((row) => (
          <Fragment key={row}>
            <div className="flex items-center justify-end pr-2 text-right text-xs font-semibold text-zinc-500">
              {row === 0 ? "Ongoing" : "One-off"}
            </div>
            {CELLS.filter((c) => c.row === row).map((cell) => {
              const index = CELLS.indexOf(cell);
              const isVisible = revealed > index;
              return (
                <div
                  key={`${cell.row}-${cell.col}`}
                  className={`group rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-transform duration-300 group-hover:scale-110">
                    <Icon path={cell.icon} className="h-5 w-5" />
                  </div>
                  <div className="h-5 overflow-hidden">
                    <RotatingLabel items={cell.examples} offset={index * 500} />
                  </div>
                  <span className="mt-0.5 block text-xs leading-tight text-zinc-500">
                    {cell.detail}
                  </span>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
