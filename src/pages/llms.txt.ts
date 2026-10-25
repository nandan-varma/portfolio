import type { APIRoute } from "astro";
import { buildSiteIndex, markdownHeaders } from "@/lib/markdown";

// https://llmstxt.org - every page on this site is also served as markdown by appending `.md`.
export const GET: APIRoute = async () =>
	new Response(await buildSiteIndex(), {
		headers: { ...markdownHeaders, "Content-Type": "text/plain; charset=utf-8" },
	});
