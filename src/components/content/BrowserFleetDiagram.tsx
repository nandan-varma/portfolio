import { useEffect, useState } from "react";
import { BraveIcon, ChromeIcon, DiaIcon, PeekIcon } from "@/components/content/BrowserIcons";

const NODES = [
  {
    id: "brave",
    icon: BraveIcon,
    accent: "#FB542B",
    title: "Brave",
    subtitle: "Personal profile",
    pos: { x: 140, y: 110 },
    path: "M320,200 Q180,200 140,110",
  },
  {
    id: "dia",
    icon: DiaIcon,
    accent: "#3f3f46",
    title: "Dia",
    subtitle: "Work profile",
    pos: { x: 500, y: 110 },
    path: "M320,200 Q460,200 500,110",
  },
  {
    id: "chrome",
    icon: ChromeIcon,
    accent: "#4285F4",
    title: "Chrome",
    subtitle: "Logged out + MCP agents",
    pos: { x: 140, y: 290 },
    path: "M320,200 Q180,200 140,290",
  },
  {
    id: "peek",
    icon: PeekIcon,
    accent: "#6366f1",
    title: "Peek",
    subtitle: "Pinned & persistent",
    pos: { x: 500, y: 290 },
    path: "M320,200 Q460,200 500,290",
  },
] as const;

const VB_W = 640;
const VB_H = 400;

function pct(v: number, total: number) {
  return `${(v / total) * 100}%`;
}

export default function BrowserFleetDiagram() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="my-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        The fleet
      </div>

      <div
        className="relative w-full"
        style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {NODES.map((node, i) => (
            <path
              key={node.id}
              d={node.path}
              fill="none"
              stroke={node.accent}
              strokeOpacity={0.55}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="1 9"
              className="transition-opacity duration-700 ease-out"
              style={{
                opacity: mounted ? 1 : 0,
                transitionDelay: `${300 + i * 150}ms`,
              }}
            />
          ))}
          {NODES.map((node, i) => (
            <circle key={`${node.id}-dot`} r={3.4} fill={node.accent}>
              <animateMotion
                dur="3.4s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
                path={node.path}
              />
            </circle>
          ))}
        </svg>

        <div
          className="absolute flex flex-col items-center gap-1.5 transition-all duration-500 ease-out"
          style={{
            left: pct(320, VB_W),
            top: pct(200, VB_H),
            opacity: mounted ? 1 : 0,
            transform: `translate(-50%, -50%) scale(${mounted ? 1 : 0.85})`,
          }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white text-zinc-400 shadow-md">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 9h18" />
            </svg>
          </div>
          <span className="rounded-full bg-white px-2 py-0.5 text-center text-[11px] font-semibold leading-tight text-zinc-500 shadow-sm">
            Whatever I open
          </span>
        </div>

        {NODES.map((node, i) => {
          const Icon = node.icon;
          return (
            <div
              key={node.id}
              className="absolute flex w-28 flex-col items-center gap-2 text-center transition-all duration-500 ease-out sm:w-32"
              style={{
                left: pct(node.pos.x, VB_W),
                top: pct(node.pos.y, VB_H),
                opacity: mounted ? 1 : 0,
                transform: `translate(-50%, -50%) translateY(${mounted ? 0 : 10}px)`,
                transitionDelay: `${450 + i * 150}ms`,
              }}
            >
              <Icon className="h-12 w-12" />
              <div>
                <span className="block text-sm font-semibold leading-tight text-zinc-900">
                  {node.title}
                </span>
                <span className="block text-[11px] leading-tight text-zinc-500">
                  {node.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
