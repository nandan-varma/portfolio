import type { APIRoute } from "astro";
import { buildSiteIndex, markdownResponse } from "@/lib/markdown";

export const GET: APIRoute = async () => markdownResponse(await buildSiteIndex());
