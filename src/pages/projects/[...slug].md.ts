import type { APIRoute, GetStaticPaths } from "astro";
import { entryToMarkdown, getProjects, markdownResponse } from "@/lib/markdown";

export const getStaticPaths = (async () =>
	(await getProjects()).map((project) => ({
		params: { slug: project.id },
		props: { project },
	}))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	markdownResponse(entryToMarkdown(props.project, "projects"));
