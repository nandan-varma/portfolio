// Page motion for client-side navigations. Hard loads use the CSS entrances in
// shared.css; every Astro navigation marks the incoming document so those CSS
// animations stay off and the choreography below runs on live elements instead
// (a named view-transition snapshot would stop glass cards blurring the canvas).
//
//   section ↔ section (navbar): content slides out one side, in from the other
//   card → detail page: the other cards sink away, then the clicked card
//   morphs open into the detail page (and closes back into it on return)
//   anything else: cards sink off the bottom and the nav lifts away, then the
//   view transition morphs shared headings, then cards rise and the nav drops
//   (only if the previous page had none).

const sections = ["/projects", "/blog", "/contact"];
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
// Exits move from the first frame (non-zero start velocity) so a click never
// reads as lag, then accelerate away.
const EASE_IN = "cubic-bezier(0.3, 0.3, 0.7, 0.6)";
// Lightly underdamped spring, mirrors --spring in shared.css.
const SPRING =
  "linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.9%, 0.938 16.7%, 1.017 19.4%, 1.067, 1.099 24.3%, 1.108 26%, 1.1, 1.082 30.6%, 1.019 38.9%, 0.998 43.1%, 0.991 47.8%, 1.001 61.4%, 1)";

const navBar = (root: ParentNode = document) =>
  root.querySelector<HTMLElement>("[data-nav-drop] > div");

function direction(from: URL, to: URL) {
  const start = sections.indexOf(from.pathname.replace(/\/$/, ""));
  const end = sections.indexOf(to.pathname.replace(/\/$/, ""));
  return start < 0 || end < 0 || start === end ? 0 : end > start ? -1 : 1;
}

const OPEN = "card-open";

// The card for a link: links either wrap a card or sit inside one.
const cardFor = (link: Element | null | undefined) =>
  link?.closest<HTMLElement>("[data-rise]") ?? link?.querySelector<HTMLElement>("[data-rise]") ?? null;

const onScreen = (el: Element) => {
  const { top, bottom } = el.getBoundingClientRect();
  return bottom > 0 && top < innerHeight;
};

const finished = (animations: Animation[]) =>
  Promise.all(animations.map((a) => a.finished.catch(() => {})));

// State carried from before-swap to after-swap.
let pending: { slide: number; hadNav: boolean; oldNames: Set<string> } | null = null;

document.addEventListener("astro:before-preparation", (event) => {
  if (reducedMotion()) return;
  const travel = direction(event.from, event.to);
  const source = cardFor(event.sourceElement?.closest("a"));
  const goingHome = new URL(event.to).pathname === "/";

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
    const cards = [...document.querySelectorAll("[data-rise]")].filter(
      (card) => card !== source && onScreen(card),
    );
    const out = cards.map((card) =>
      card.animate([{ transform: "none" }, { transform: "translateY(100vh)" }], {
        duration: 260, easing: EASE_IN, fill: "forwards",
      }),
    );
    const nav = navBar();
    if (nav && goingHome) {
      out.push(nav.animate([{ transform: "none" }, { transform: "translateY(-150%)" }], {
        duration: 260, easing: EASE_IN, fill: "forwards",
      }));
    }
    return out;
  };

  const load = event.loader;
  event.loader = async () => {
    // Name the old shared surface before the transition snapshots this page:
    // the clicked card opens into the detail page, a detail page closes back.
    const surface = source ?? document.querySelector<HTMLElement>("[data-card-target]");
    if (surface && !travel) surface.style.viewTransitionName = OPEN;
    const animations = exit();
    // A superseding navigation drops the exit so nothing is left off-screen.
    event.signal.addEventListener("abort", () => animations.forEach((a) => a.cancel()), { once: true });
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
  if (reducedMotion()) return (pending = null);

  const slide = direction(event.from, event.to);
  // Section switches animate live content only; no snapshot crossfade.
  if (slide) event.viewTransition.skipTransition();

  // Names on the outgoing page: a card whose title morphs from one of these
  // is placed by the view transition, so it must not also rise.
  const oldNames = new Set(
    [...document.querySelectorAll("[data-astro-transition-scope]")].map(
      (el) => getComputedStyle(el).viewTransitionName,
    ),
  );
  pending = { slide, hadNav: !!navBar(), oldNames };

  // The old side was named in the loader; name the matching new surface: the
  // detail page when a card opens, or the linking card when a detail closes.
  if (!document.querySelector(`[style*="${OPEN}"]`)) return;
  const target = document.querySelector("[data-card-target]")
    ? cardFor(event.newDocument.querySelector(`a[href="${event.from.pathname}"]`))
    : event.newDocument.querySelector<HTMLElement>("[data-card-target]");
  if (target) target.style.viewTransitionName = OPEN;
});

// Live glass needs no name once the transition is done (it blocks backdrop blur).
document.addEventListener("astro:page-load", () => {
  for (const el of document.querySelectorAll<HTMLElement>(`[style*="${OPEN}"]`)) {
    el.style.viewTransitionName = "";
  }
});

document.addEventListener("astro:after-swap", () => {
  const state = pending;
  pending = null;
  if (!state) return;

  if (state.slide) {
    document.querySelector("[data-section-content]")?.animate(
      [{ transform: `translateX(${-state.slide * 100}vw)` }, { transform: "none" }],
      { duration: 480, easing: EASE_OUT },
    );
    return;
  }

  // Unpaired named elements inside cards rise via ::view-transition-new in
  // shared.css with the same timing, so snapshots and live cards stay together.
  for (const card of document.querySelectorAll("[data-rise]")) {
    const morphs = [...card.querySelectorAll("[data-astro-transition-scope]")].some((el) =>
      state.oldNames.has(getComputedStyle(el).viewTransitionName),
    );
    if (morphs || !onScreen(card)) continue;
    card.animate([{ transform: "translateY(100vh)" }, { transform: "none" }], {
      duration: 800, easing: EASE_OUT, fill: "backwards",
    });
  }

  const nav = navBar();
  if (nav && !state.hadNav) {
    nav.animate([{ transform: "translateY(-150%)" }, { transform: "none" }], {
      duration: 700, easing: SPRING, fill: "backwards",
    });
  }
});
