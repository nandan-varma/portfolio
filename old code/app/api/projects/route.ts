import { allProjects } from "contentlayer/generated";

export async function GET() {
  const projects = allProjects.map(project => ({
    title: project.title,
    description: project.description,
    date: project.date,
    repository: project.repository,
    url: project.url
  }));
  return new Response(JSON.stringify(projects), {
    headers: { "Content-Type": "application/json" },
  });
}
