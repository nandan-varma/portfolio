import type { APIRoute, GetStaticPaths } from "astro";
import { entryToMarkdown, getProjects, markdownHeaders } from "@/lib/markdown";

export const getStaticPaths = (async () =>
	(await getProjects()).map((project) => ({
		params: { slug: project.id },
		props: { project },
	}))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	new Response(entryToMarkdown(props.project, "projects"), { headers: markdownHeaders });
