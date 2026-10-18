// Event tracking for PostHog. The snippet in components/posthog.astro defines
// window.posthog as a queueing stub, so calls made before the SDK loads still send.
//
// Markup declares events instead of per-page scripts:
//   <body data-analytics-page-event="project_opened" data-analytics-props='{"project_id":"mars"}'>
//   <a data-analytics-event="project_card_clicked" data-analytics-props='{"project_id":"mars"}'>
// Any other link to another site is captured as outbound_link_clicked.

type Properties = Record<string, unknown>;

declare global {
  interface Window {
    posthog?: { capture(event: string, properties?: Properties, options?: { timestamp?: Date }): void };
  }
}

const SITE_HOSTS = new Set([location.hostname, "nandan.fyi", "www.nandan.fyi"]);
let trackedBody: HTMLElement | null = null;
// document.referrer only covers the first load; view transitions keep it unchanged.
let previousUrl = document.referrer;

export function capture(event: string, properties?: Properties) {
  // Pin the time and page now; a queued call is replayed after the SDK loads.
  window.posthog?.capture(event, { $current_url: location.href, $pathname: location.pathname, ...properties }, { timestamp: new Date() });
}

function readProps(element: HTMLElement): Properties {
  try {
    return JSON.parse(element.dataset.analyticsProps || "{}");
  } catch {
    return {};
  }
}

function trackPage() {
  // astro:page-load fires once per settled page; the body check guards the initial-load race.
  if (trackedBody === document.body) return;
  trackedBody = document.body;
  capture("$pageview", { title: document.title });
  const event = document.body.dataset.analyticsPageEvent;
  if (event) capture(event, { referrer: previousUrl || null, ...readProps(document.body) });
  previousUrl = location.href;
}

function trackClick(event: MouseEvent) {
  if (event.button > 1) return; // Primary and middle clicks only
  const target = event.target instanceof Element ? event.target : null;
  const element = target?.closest<HTMLElement>("[data-analytics-event], a[href]");
  if (!element || element.closest(".ph-no-capture")) return;

  if (element.dataset.analyticsEvent) {
    capture(element.dataset.analyticsEvent, readProps(element));
  } else if (element instanceof HTMLAnchorElement && /^https?:$/.test(element.protocol) && !SITE_HOSTS.has(element.hostname)) {
    capture("outbound_link_clicked", {
      link_url: element.origin + element.pathname,
      link_domain: element.hostname,
      link_text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100),
    });
  }
}

export function initializeAnalytics() {
  if (!window.posthog) return;
  document.addEventListener("astro:page-load", trackPage);
  // A back/forward cache restore shows a frozen page without firing astro:page-load.
  addEventListener("pageshow", (event) => {
    if (event.persisted) {
      trackedBody = null;
      trackPage();
    }
  });
  document.addEventListener("click", trackClick, { capture: true });
  document.addEventListener("auxclick", trackClick, { capture: true });
  // This module can run after the router's first astro:page-load has already fired.
  if (document.readyState !== "loading") trackPage();
}
