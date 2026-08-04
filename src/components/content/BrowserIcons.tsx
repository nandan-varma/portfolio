import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function Mark({
  tint,
  border,
  className = "h-11 w-11",
  children,
}: {
  tint: string;
  border: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border shadow-sm ${className}`}
      style={{ background: tint, borderColor: border }}
    >
      {children}
    </div>
  );
}

export function ChromeIcon({ className = "h-11 w-11" }: IconProps) {
  return (
    <Mark tint="#ffffff" border="#e4e4e7" className={className}>
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]">
        <path d="M12 3 A9 9 0 0 1 19.79 16.5 L12 12 Z" fill="#EA4335" />
        <path d="M19.79 16.5 A9 9 0 0 1 4.21 16.5 L12 12 Z" fill="#34A853" />
        <path d="M4.21 16.5 A9 9 0 0 1 12 3 L12 12 Z" fill="#FBBC05" />
        <circle cx="12" cy="12" r="4" fill="#fff" />
        <circle cx="12" cy="12" r="3.1" fill="#4285F4" />
      </svg>
    </Mark>
  );
}

export function BraveIcon({ className = "h-11 w-11" }: IconProps) {
  return (
    <Mark tint="#fff7f2" border="#fbd8c8" className={className}>
      <img
        src="/blog/browser/brave.png"
        alt="Brave"
        className="h-[68%] w-[68%] object-contain"
      />
    </Mark>
  );
}

export function DiaIcon({ className = "h-11 w-11" }: IconProps) {
  return (
    <img
      src="/blog/browser/dia.png"
      alt="Dia"
      className={`shrink-0 rounded-2xl object-cover shadow-sm ${className}`}
    />
  );
}

export function PeekIcon({ className = "h-11 w-11" }: IconProps) {
  return (
    <Mark tint="#eef2ff" border="#c7d2fe" className={className}>
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]">
        <rect
          x="7.5"
          y="3"
          width="9"
          height="16"
          rx="2.2"
          fill="none"
          stroke="#6366f1"
          strokeWidth="1.7"
        />
        <rect x="10.5" y="16.2" width="3" height="1" rx="0.5" fill="#6366f1" />
        <path
          d="M15 2.2 18.3 3.5 17 6.8"
          fill="none"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Mark>
  );
}
