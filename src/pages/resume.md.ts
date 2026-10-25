import type { APIRoute } from "astro";
import resume from "@/content/resume.md?raw";
import { getProjects, listLine, markdownResponse } from "@/lib/markdown";

// All resume text lives in resume.md; only the project entries are generated, from the project pages.
const FEATURED = ["mars", "pushstack", "nemesis", "gitflow", "meadows", "fexer", "sigrun"];
const MARKER = "<!-- featured-projects -->";

export const GET: APIRoute = async () => {
	const projects = await getProjects();
	const lines = FEATURED.flatMap((id) => projects.find((project) => project.id === id) ?? []).map((p) =>
		listLine(`/projects/${p.id}`, p.data.title, p.data.description),
	);
	return markdownResponse(`${resume.replace(MARKER, lines.join("\n")).trim()}\n`);
};
