import { SITE_TITLE } from "@/consts";
import { getCollection, type CollectionEntry } from "astro:content";

const SITE = "https://www.nandan.fyi";

export const markdownHeaders = {
	"Content-Type": "text/markdown; charset=utf-8",
	"Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
	"X-Robots-Tag": "noindex",
};

export const absolute = (path: string) => new URL(path, SITE).href;

/** Every markdown response starts with a pointer to the site index, so agents landing on one page can find the rest. */
export const markdownResponse = (body: string) =>
	new Response(`> Site index for LLMs: ${absolute("/llms.txt")}\n\n${body}`, { headers: markdownHeaders });

/** Markdown twin of an HTML pathname: `/` -> `/index.md`, `/blog/x` -> `/blog/x.md`. */
export const markdownPath = (pathname: string) => {
	const trimmed = pathname.replace(/\/+$/, "");
	return trimmed === "" ? "/index.md" : `${trimmed}.md`;
};

/** Pathnames that have a markdown twin, used for the `<link rel="alternate">` hint. */
export const hasMarkdownTwin = (pathname: string) =>
	/^\/(?:(?:blog|projects)(?:\/[^/]+)?|contact)?\/?$/.test(pathname);

export const getBlogPosts = async () =>
	(await getCollection("blog"))
		.filter((post) => !post.data.draft)
		.sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date));

export const getProjects = async () =>
	(await getCollection("project"))
		.filter((project) => project.data.published)
		.sort((a, b) => Date.parse(b.data.date) - Date.parse(a.data.date));

/**
 * Turn an MDX body into plain markdown: drop ESM imports and interactive
 * component embeds (no text equivalent), swap `<video>` for a link, and make
 * site-relative links absolute and pointed at the markdown twin.
 */
export const cleanMdx = (body: string) => {
	let inFence = false;
	const lines = body.split("\n").filter((line) => {
		if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
		if (inFence) return true;
		return !/^(import|export)\s/.test(line) && !/^\s*<[A-Z]\w*(\s[^>]*)?\/>\s*$/.test(line) && !/^\s*<br\s*\/?>\s*$/.test(line);
	});
	return lines
		.join("\n")
		.replace(/<video[\s\S]*?<\/video>/g, (video) => {
			const src = video.match(/src="([^"]+)"/)?.[1];
			return src ? `[Video](${src})` : "";
		})
		.replace(/\]\((\/[^)\s#]*)\)/g, (_, path: string) => {
			const target = /^\/(blog|projects)\/[^/.]+$|^\/(blog|projects)$|^\/$/.test(path)
				? markdownPath(path)
				: path;
			return `](${absolute(target)})`;
		})
		.replace(/\n{3,}/g, "\n\n")
		.trim();
};

const frontmatterLine = (label: string, value?: string) => (value ? `- ${label}: ${value}\n` : "");

export const entryToMarkdown = (
	entry: CollectionEntry<"blog"> | CollectionEntry<"project">,
	section: "blog" | "projects",
) => {
	const { title, description, date } = entry.data;
	const repository = "repository" in entry.data ? entry.data.repository : undefined;
	const url = "url" in entry.data ? entry.data.url : undefined;
	return (
		`# ${title}\n\n> ${description}\n\n` +
		frontmatterLine("Published", date) +
		frontmatterLine("Source", repository && `https://github.com/${repository}`) +
		frontmatterLine("Live", url) +
		frontmatterLine("Canonical", absolute(`/${section}/${entry.id}`)) +
		`\n${cleanMdx(entry.body ?? "")}\n`
	);
};

export const listLine = (path: string, title: string, description: string) =>
	`- [${title}](${absolute(markdownPath(path))}): ${description}`;

/** The site index served at both `/llms.txt` and `/index.md`. */
export const buildSiteIndex = async () => {
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
	return body;
};
