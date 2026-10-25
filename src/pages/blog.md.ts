import type { APIRoute } from "astro";
import { getBlogPosts, listLine, markdownResponse } from "@/lib/markdown";
import { SITE_TITLE } from "@/consts";

export const GET: APIRoute = async () => {
	const posts = await getBlogPosts();
	const lines = posts.map((post) => listLine(`/blog/${post.id}`, post.data.title, post.data.description));
	return markdownResponse(
		`# Blog | ${SITE_TITLE}\n\n> Writing by Nandan Varma on software engineering, side projects, and what building them taught him.\n\n${lines.join("\n")}\n`
	);
};
