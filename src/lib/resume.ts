import type { APIContext } from "astro";
import { waitUntil } from "@vercel/functions";
import { POSTHOG_ENABLED, POSTHOG_INGEST_HOST, POSTHOG_KEY } from "@/lib/posthog";

const RESUMES: Record<string, string> = {
  "/cv": "https://qujr12qsco.ufs.sh/f/fthLDAMTNUTlwdChqLZue7hJ43mSDHQtXwVdx90vZ8kIKgM5",
  "/resume": "https://qujr12qsco.ufs.sh/f/66ba979a-9fcd-4ed7-ae19-a564d45889a6-fgc05v.pdf",
  "/resume/apple": "https://2puzbcbw6l.ufs.sh/f/AmQx6INo4gSiKHDyLDPZfDvQP9eRg6xphAlI78dYFUOGJoLM",
};
// Each path has its own route file, so unknown variants fall through to the site 404 page.
// Link unfurlers and scanners open shared resume links without a person behind them.
const BOT_AGENT = /bot|crawl|spider|slurp|preview|scan|facebookexternalhit|embedly|whatsapp|telegram|discord|skype|curl|wget|python|go-http|headless|lighthouse/i;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Redirects immediately; the PostHog event is sent after the response via waitUntil.
export function openResume(context: APIContext): Response {
  const variant = context.url.pathname.replace(/\/$/, "");
  const destination = RESUMES[variant];
  if (!destination) throw new Error(`No resume for ${variant}`);

  const userAgent = context.request.headers.get("user-agent") ?? "";
  if (POSTHOG_KEY && POSTHOG_ENABLED && context.request.method === "GET" && !BOT_AGENT.test(userAgent)) {
    waitUntil(captureResumeOpened(context, POSTHOG_KEY, variant, userAgent).catch((error) => console.error("resume_opened capture failed", error)));
  }
  return new Response(null, { status: 302, headers: { Location: destination, "Cache-Control": "no-store" } });
}

async function captureResumeOpened({ url, request, cookies, clientAddress }: APIContext, key: string, variant: string, userAgent: string) {
  // Visitors who came from the site keep their PostHog identity and session.
  let distinctId: string = crypto.randomUUID();
  let sessionId: string | undefined;
  try {
    const state = JSON.parse(cookies.get(`ph_${key}_posthog`)?.value ?? "{}");
    if (typeof state.distinct_id === "string") distinctId = state.distinct_id;
    const [lastActivity, id] = state.$sesid ?? [];
    if (typeof id === "string" && Date.now() - lastActivity < SESSION_TIMEOUT_MS) sessionId = id;
  } catch {
    // Malformed or missing cookie: count as a new anonymous visitor.
  }

  const referrer = request.headers.get("referer");
  const campaign = Object.fromEntries([...url.searchParams].filter(([name]) => name.startsWith("utm_") || name.endsWith("clid")));
  await fetch(`${POSTHOG_INGEST_HOST}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify({
      api_key: key,
      event: "resume_opened",
      distinct_id: distinctId,
      timestamp: new Date().toISOString(),
      properties: {
        resume_variant: variant,
        $process_person_profile: false,
        $lib: "portfolio-server",
        $current_url: url.origin + url.pathname,
        $host: url.host,
        $pathname: url.pathname,
        $referrer: referrer ?? "$direct",
        $referring_domain: referringDomain(referrer),
        $raw_user_agent: userAgent,
        $ip: clientAddress,
        ...(sessionId && { $session_id: sessionId }),
        ...campaign,
      },
    }),
  });
}

function referringDomain(referrer: string | null): string {
  if (!referrer) return "$direct";
  try {
    return new URL(referrer).hostname;
  } catch {
    return "$direct"; // Malformed Referer header
  }
}
