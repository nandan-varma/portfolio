import { openResume } from "@/lib/resume";

// Rendered on demand so every open is counted before redirecting to the PDF.
export const prerender = false;
export const GET = openResume;
