import type { APIRoute } from "astro";
import { getProjects, listLine, markdownHeaders } from "@/lib/markdown";
import { SITE_TITLE } from "@/consts";

export const GET: APIRoute = async () => {
	const projects = await getProjects();
	const lines = projects.map((project) =>
		listLine(`/projects/${project.id}`, project.data.title, project.data.description),
	);
	return new Response(
		`# Projects | ${SITE_TITLE}\n\n> Software projects by Nandan Varma - operating systems, compilers, developer tools, and full-stack apps built from scratch.\n\n${lines.join("\n")}\n`,
		{ headers: markdownHeaders },
	);
};
