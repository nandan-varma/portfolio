// Page motion for client-side navigations. Hard loads use the CSS entrances in
// shared.css; every Astro navigation marks the incoming document so those CSS
// animations stay off and the choreography below runs on live elements instead
// (a named view-transition snapshot would stop glass cards blurring the canvas).
//
//   section ↔ section (navbar): content slides out one side, in from the other
//   card ↔ detail page: the other cards sink away while the clicked card lifts;
//   a live glass frame then springs from the card to the detail page's panel
//   (or from the panel back to its card) and hands over to the real surface,
//   which is identical, so the card reads as one object opening and closing
//   anything else: cards sink off the bottom and the nav lifts away, then the
//   view transition morphs shared headings, then cards rise and the nav drops
//   (only if the previous page had none).

const sections = ["/projects", "/blog", "/contact"];
const indexes = ["/projects", "/blog"];
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// A back/forward swipe the browser already animated (iOS, Android, Safari)
// must not be animated again; Astro also skips its view transition then.
let browserAnimated = false;
window.navigation?.addEventListener("navigate", (event) => {
  browserAnimated = event.hasUAVisualTransition;
});
const stillMotion = () => reducedMotion() || browserAnimated;
const path = (url: URL) => url.pathname.replace(/\/$/, "") || "/";

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
// Exits move from the first frame (non-zero start velocity) so a click never
// reads as lag, then accelerate away.
const EASE_IN = "cubic-bezier(0.3, 0.3, 0.7, 0.6)";
// Lightly underdamped spring, mirrors --spring in shared.css.
const SPRING =
  "linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.017 19.4%, 1.067, 1.099 24.3%, 1.108 26%, 1.1, 1.082 30.6%, 1.019 38.9%, 0.998 43.1%, 0.991 47.8%, 1.001 61.4%, 1)";

const MORPH = "[data-morph]";
const FRAME = "card-frame"; // view-transition-name, see shared.css

// Card titles and descriptions carry a data-morph key, not a permanent
// view-transition-name: every named element is captured and restyled on each
// frame of every transition, so only the one card ↔ panel pair in flight is
// named, and only for that transition.
function nameMorphs(root: ParentNode | null, on: boolean) {
  for (const el of root?.querySelectorAll<HTMLElement>(MORPH) ?? []) {
    el.style.viewTransitionName = on ? `morph-${el.dataset.morph!.replace(/[^\w-]/g, "_")}` : "";
    el.style.setProperty("view-transition-class", on ? "card-morph" : "");
  }
}

const navBar = (root: ParentNode = document) =>
  root.querySelector<HTMLElement>("[data-nav-drop] > div");

function direction(from: URL, to: URL) {
  const start = sections.indexOf(path(from));
  const end = sections.indexOf(path(to));
  return start < 0 || end < 0 || start === end ? 0 : end > start ? -1 : 1;
}

const onScreen = (el: Element) => {
  const { top, bottom } = el.getBoundingClientRect();
  return bottom > 0 && top < innerHeight;
};

const finished = (animations: Animation[]) =>
  Promise.all(animations.map((a) => a.finished.catch(() => {})));

// The card for a link: links either wrap a card or sit inside one.
const cardFor = (link: Element | null | undefined) =>
  link?.closest<HTMLElement>("[data-rise]") ?? link?.querySelector<HTMLElement>("[data-rise]") ?? null;

const cardLinkingTo = (root: ParentNode, to: string) =>
  cardFor(root.querySelector(`a[href="${to}"]`));

// A surface's content outside its morphing elements, which has no
// counterpart on the other page and so fades with the surface instead.
function looseParts(root: Element): HTMLElement[] {
  const parts: HTMLElement[] = [];
  for (const child of root.children) {
    if (child.matches(MORPH)) continue;
    if (child.querySelector(MORPH)) parts.push(...looseParts(child));
    else parts.push(child as HTMLElement);
  }
  return parts;
}

// ── The frame: a live glass surface that springs between card and panel ──

type Box = { x: number; y: number; w: number; h: number };
const KEYS = ["x", "y", "w", "h"] as const;
const boxOf = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

// Near-critically damped: arrives fast with no visible bounce.
const STIFFNESS = 320;
const DAMPING = 35;

let flight: { raf: number; land: () => void } | null = null;

function landFlight() {
  if (!flight) return;
  cancelAnimationFrame(flight.raf);
  flight.land();
  flight = null;
}

function fly(from: Box, look: Record<string, string>, target: HTMLElement) {
  landFlight();
  const frame = document.createElement("div");
  frame.className = "glass-surface";
  Object.assign(frame.style, {
    position: "fixed", margin: "0", pointerEvents: "none", viewTransitionName: FRAME,
    transition: "border-color 300ms, background-color 300ms, backdrop-filter 300ms",
    ...look, // start with the source's exact look (e.g. hovered), then settle
  });
  // Just before the target, so the target's content paints above the frame.
  target.before(frame);
  target.dataset.surfaceHidden = "";
  const parts = looseParts(target);
  for (const part of parts) part.style.opacity = "0";

  const pos = { ...from };
  const vel = { x: 0, y: 0, w: 0, h: 0 };
  const apply = () => Object.assign(frame.style, {
    left: `${pos.x}px`, top: `${pos.y}px`, width: `${pos.w}px`, height: `${pos.h}px`,
  });
  apply();

  let last = performance.now();
  let settled = false;
  const step = (now: number) => {
    if (!settled) {
      settled = true;
      Object.assign(frame.style, Object.fromEntries(Object.keys(look).map((key) => [key, ""])));
    }
    const dt = Math.min((now - last) / 1000, 1 / 30) / 4;
    last = now;
    // Chase the live target so scroll restoration or late layout can't strand it.
    const to = boxOf(target);
    let moving = false;
    for (const key of KEYS) {
      for (let i = 0; i < 4; i++) {
        vel[key] += (STIFFNESS * (to[key] - pos[key]) - DAMPING * vel[key]) * dt;
        pos[key] += vel[key] * dt;
      }
      if (Math.abs(to[key] - pos[key]) > 0.5 || Math.abs(vel[key]) > 8) moving = true;
    }
    apply();
    if (moving) flight!.raf = requestAnimationFrame(step);
    else landFlight();
  };

  flight = {
    raf: requestAnimationFrame(step),
    land: () => {
      // The real surface sits exactly under the frame: swap them in one frame.
      delete target.dataset.surfaceHidden;
      frame.remove();
      for (const part of parts) {
        part.style.opacity = "";
        part.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EASE_OUT });
      }
    },
  };
}

// A page stashed in the back/forward cache must not come back mid-flight.
addEventListener("pagehide", landFlight);

// ── Navigation choreography ──

// The card (or detail panel) leaving through the frame, from preparation to swap.
let leaving: { surface: HTMLElement; opening: boolean } | null = null;
let pendingFlight: { from: Box; look: Record<string, string>; opening: boolean; back: string } | null = null;

// State carried from before-swap to after-swap.
let pending: { slide: number; hadNav: boolean } | null = null;

document.addEventListener("astro:before-preparation", (event) => {
  landFlight();
  leaving = null;
  if (stillMotion()) return;
  const travel = direction(event.from, event.to);
  const to = path(event.to);
  const panel = document.querySelector<HTMLElement>("[data-card-target]");

  if (!travel) {
    const card = cardFor(event.sourceElement?.closest("a")) ?? cardLinkingTo(document, to);
    if (card) leaving = { surface: card, opening: true };
    else if (panel && indexes.includes(to)) leaving = { surface: panel, opening: false };
  }

  const exit = (): Animation[] => {
    if (travel) {
      const content = document.querySelector<HTMLElement>("[data-section-content]");
      return content
        ? [content.animate(
            [{ transform: "none" }, { transform: `translateX(${travel * 100}vw)` }],
            { duration: 220, easing: EASE_IN, fill: "forwards" },
          )]
        : [];
    }
    const out: Animation[] = [];
    const fadeOut = (el: Element) =>
      out.push(el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 160, easing: EASE_IN, fill: "forwards",
      }));
    if (leaving) {
      // Only the morphing title and description survive with the frame.
      looseParts(leaving.surface).forEach(fadeOut);
      if (leaving.opening) {
        out.push(leaving.surface.animate(
          [{ transform: "none" }, { transform: "translateY(-4px) scale(1.01)" }],
          { duration: 200, easing: EASE_OUT, fill: "forwards" },
        ));
      } else {
        const body = document.querySelector("[data-detail-body]");
        if (body) fadeOut(body);
      }
    }
    // Read every position before the first animate() invalidates layout.
    const sinking = [...document.querySelectorAll("[data-rise]")].filter(
      (card) => card !== leaving?.surface && onScreen(card),
    );
    for (const card of sinking) {
      out.push(card.animate([{ transform: "none" }, { transform: "translateY(100vh)" }], {
        duration: 260, easing: EASE_IN, fill: "forwards",
      }));
    }
    const nav = navBar();
    if (nav && (to === "/" || leaving?.opening)) {
      out.push(nav.animate([{ transform: "none" }, { transform: "translateY(-150%)" }], {
        duration: 260, easing: EASE_IN, fill: "forwards",
      }));
    }
    return out;
  };

  const load = event.loader;
  event.loader = async () => {
    // Named before the old page is captured; its snapshot is hidden and the
    // frame, under the same name, takes its place on the new page.
    const mine = leaving;
    if (mine) {
      mine.surface.style.viewTransitionName = FRAME;
      nameMorphs(mine.surface, true);
    }
    const animations = exit();
    // A superseding navigation drops the exit so nothing is left off-screen.
    event.signal.addEventListener("abort", () => {
      animations.forEach((a) => a.cancel());
      if (mine) {
        mine.surface.style.viewTransitionName = "";
        nameMorphs(mine.surface, false);
      }
      if (leaving === mine) leaving = null;
    }, { once: true });
    await Promise.all([load(), finished(animations)]);
  };
});

document.addEventListener("astro:before-swap", (event) => {
  // Skipped and superseded transitions reject ready with AbortError.
  void event.viewTransition.ready.catch((error) => {
    if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
  });
  // Client navigations never replay the hard-load CSS entrances.
  event.newDocument.documentElement.dataset.clientNav = "";
  pendingFlight = null;
  if (stillMotion()) return (pending = null);

  const slide = direction(event.from, event.to);
  // Section switches animate live content only; no snapshot crossfade.
  if (slide) event.viewTransition.skipTransition();

  pending = { slide, hadNav: !!navBar() };

  if (leaving) {
    const style = getComputedStyle(leaving.surface);
    pendingFlight = {
      from: boxOf(leaving.surface),
      look: {
        borderColor: style.borderColor,
        backgroundColor: style.backgroundColor,
        backdropFilter: style.backdropFilter,
      },
      opening: leaving.opening,
      back: path(event.from),
    };
    // Pair the morphs with the incoming panel, or with the card closing back.
    const landing = leaving.opening
      ? event.newDocument.querySelector("[data-card-target]")
      : cardLinkingTo(event.newDocument, path(event.from));
    if (landing) nameMorphs(landing, true);
    // Nowhere to land (e.g. an unlisted draft): let the old surface fade out
    // with the page instead of vanishing.
    else event.newDocument.documentElement.dataset.frameOrphan = "";
    leaving = null;
  }
  // The frame's name only matters for this transition; afterwards a name
  // would make it a backdrop root and stop its glass blurring the page.
  void event.viewTransition.finished.finally(() => {
    for (const el of document.querySelectorAll<HTMLElement>(`[style*="${FRAME}"]`)) {
      el.style.viewTransitionName = "";
    }
    nameMorphs(document, false);
  });
});

document.addEventListener("astro:after-swap", () => {
  const state = pending;
  const card = pendingFlight;
  pending = pendingFlight = null;
  if (!state) return;

  if (state.slide) {
    document.querySelector("[data-section-content]")?.animate(
      [{ transform: `translateX(${-state.slide * 100}vw)` }, { transform: "none" }],
      { duration: 480, easing: EASE_OUT },
    );
    return;
  }

  // The card closing back (or the panel opening) is placed by the frame.
  const target = card
    ? card.opening
      ? document.querySelector<HTMLElement>("[data-card-target]")
      : cardLinkingTo(document, card.back)
    : null;

  // Every position is read before the first animate() invalidates layout.
  const rising = [...document.querySelectorAll("[data-rise]")].filter(
    (el) => el !== target && onScreen(el),
  );
  for (const el of rising) {
    el.animate([{ transform: "translateY(100vh)" }, { transform: "none" }], {
      duration: 800, easing: EASE_OUT, fill: "backwards",
    });
  }
  if (card && target) fly(card.from, card.look, target);

  // The detail page's article follows its panel in.
  if (card?.opening) {
    document.querySelector("[data-detail-body]")?.animate(
      [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
      { duration: 520, delay: 120, easing: EASE_OUT, fill: "backwards" },
    );
  }

  const nav = navBar();
  if (nav && !state.hadNav) {
    nav.animate([{ transform: "translateY(-150%)" }, { transform: "none" }], {
      duration: 700, easing: SPRING, fill: "backwards",
    });
  }
});
