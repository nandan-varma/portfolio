import type { APIRoute } from "astro";
import { markdownResponse } from "@/lib/markdown";
import { SITE_TITLE } from "@/consts";

export const GET: APIRoute = () =>
	markdownResponse(
		`# Contact | ${SITE_TITLE}\n\n> Get in touch with Nandan Varma via email, GitHub, or LinkedIn.\n\n- Email: contact@nandan.fyi\n- GitHub: https://github.com/nandan-varma\n- LinkedIn: https://www.linkedin.com/in/nandanvarma/\n`
	);
