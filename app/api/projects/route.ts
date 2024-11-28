import { allProjects } from "contentlayer/generated";

export async function GET() {
  const projectNames = allProjects.map(project => project.title);
  return new Response(JSON.stringify(projectNames), {
    headers: { "Content-Type": "application/json" },
  });
}
