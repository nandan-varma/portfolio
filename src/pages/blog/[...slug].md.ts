import type { APIRoute, GetStaticPaths } from "astro";
import { entryToMarkdown, getBlogPosts, markdownHeaders } from "@/lib/markdown";

export const getStaticPaths = (async () =>
	(await getBlogPosts()).map((post) => ({
		params: { slug: post.id },
		props: { post },
	}))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	new Response(entryToMarkdown(props.post, "blog"), { headers: markdownHeaders });
