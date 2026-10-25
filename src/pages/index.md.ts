import type { APIRoute } from "astro";
import { absolute, markdownHeaders, markdownPath } from "@/lib/markdown";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/consts";

export const GET: APIRoute = () =>
	new Response(
		`# ${SITE_TITLE}\n\n> ${SITE_DESCRIPTION}\n\n- [Projects](${absolute(markdownPath("/projects"))})\n- [Blog](${absolute(markdownPath("/blog"))})\n- [Contact](${absolute(markdownPath("/contact"))})\n`,
		{ headers: markdownHeaders },
	);
