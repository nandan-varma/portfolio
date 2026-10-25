import { next, rewrite } from "@vercel/functions";

// Vercel serves prerendered files before vercel.json rewrites run, so `Accept: text/markdown`
// negotiation has to happen here. Browsers (text/html first, or */*) are untouched.
export const config = {
	matcher: ["/", "/blog", "/projects", "/contact", "/blog/:slug", "/projects/:slug"],
};

const quality = (accept: string, type: string) => {
	const match = accept
		.split(",")
		.map((part) => part.trim().split(";"))
		.find(([mime]) => mime.trim().toLowerCase() === type);
	if (!match) return 0;
	const q = match.slice(1).find((param) => param.trim().startsWith("q="));
	return q ? Number(q.trim().slice(2)) : 1;
};

export default function middleware(request: Request) {
	const accept = request.headers.get("accept") ?? "";
	if (quality(accept, "text/markdown") > quality(accept, "text/html")) {
		const { pathname } = new URL(request.url);
		const trimmed = pathname.replace(/\/+$/, "");
		return rewrite(new URL(trimmed === "" ? "/index.md" : `${trimmed}.md`, request.url));
	}
	return next();
}
