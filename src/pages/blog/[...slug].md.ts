import type { APIRoute, GetStaticPaths } from "astro";
import { entryToMarkdown, getBlogPosts, markdownResponse } from "@/lib/markdown";

export const getStaticPaths = (async () =>
	(await getBlogPosts()).map((post) => ({
		params: { slug: post.id },
		props: { post },
	}))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	markdownResponse(entryToMarkdown(props.post, "blog"));
