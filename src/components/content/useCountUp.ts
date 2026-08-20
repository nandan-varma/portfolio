import { useEffect, useState } from "react";

export function useCountUp(target: number, mounted: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, target, duration]);

  return value;
}
