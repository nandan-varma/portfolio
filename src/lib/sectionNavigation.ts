const sections = ["/projects", "/blog", "/contact"];
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function direction(from: URL, to: URL) {
  const start = sections.indexOf(from.pathname.replace(/\/$/, ""));
  const end = sections.indexOf(to.pathname.replace(/\/$/, ""));
  return start < 0 || end < 0 || start === end ? 0 : end > start ? -1 : 1;
}

// Animate live content: a named ancestor snapshot creates a backdrop root,
// preventing glass cards from sampling the canvas behind them.
document.addEventListener("astro:before-swap", (event) => {
  // Both a deliberate section skip and a superseding navigation can cancel
  // ready before it settles. Observe every transition, including home/detail
  // routes, while keeping unexpected failures visible to error monitoring.
  void event.viewTransition.ready.catch((error) => {
    if (!(error instanceof DOMException && error.name === "AbortError")) throw error;
  });
  const travel = direction(event.from, event.to);
  if (!travel) return;
  // Section navigation uses live transforms; detail routes retain view transitions.
  event.viewTransition.skipTransition();
  const content = event.newDocument.querySelector<HTMLElement>("[data-section-content]");
  if (content && !reducedMotion()) content.dataset.enterFrom = String(-travel * 24);
});

document.addEventListener("astro:after-swap", () => {
  const content = document.querySelector<HTMLElement>("[data-enter-from]");
  if (!content) return;
  const offset = Number(content.dataset.enterFrom);
  delete content.dataset.enterFrom;
  if (reducedMotion()) return;
  content.animate([
    { transform: `translateX(${offset}px)` },
    { transform: "translateX(0)" },
  ], { duration: 280, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" });
});
