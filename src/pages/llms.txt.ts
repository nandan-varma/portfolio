import type { APIRoute } from "astro";
import { absolute, getBlogPosts, getProjects, listLine, markdownHeaders, markdownPath } from "@/lib/markdown";
import { SITE_TITLE } from "@/consts";

// https://llmstxt.org - every page on this site is also served as markdown by appending `.md`.
export const GET: APIRoute = async () => {
	const [projects, posts] = await Promise.all([getProjects(), getBlogPosts()]);
	const section = (lines: string[]) => lines.join("\n");
	const body = `# ${SITE_TITLE}

> Portfolio of Nandan Varma, a software engineer: operating systems, compilers, developer tools, and full-stack apps built from scratch, plus writing about building them.

Every page on this site has a markdown version at the same URL with \`.md\` appended (the home page is \`/index.md\`).

## Pages

- [Home](${absolute(markdownPath("/"))}): Site overview
- [Projects](${absolute(markdownPath("/projects"))}): All published projects
- [Blog](${absolute(markdownPath("/blog"))}): All published posts
- [Contact](${absolute(markdownPath("/contact"))}): Email, GitHub and LinkedIn

## Projects

${section(projects.map((p) => listLine(`/projects/${p.id}`, p.data.title, p.data.description)))}

## Blog

${section(posts.map((p) => listLine(`/blog/${p.id}`, p.data.title, p.data.description)))}

## Optional

- [Resume](${absolute("/resume")}): Resume (PDF)
- [RSS feed](${absolute("/rss.xml")}): Projects feed
- [Sitemap](${absolute("/sitemap-index.xml")}): All HTML pages
`;
	return new Response(body, {
		headers: { ...markdownHeaders, "Content-Type": "text/plain; charset=utf-8" },
	});
};
