import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const projectSchema = z.object({
	title: z.string(),
	description: z.string(),
	// Transform string to Date object
	date: z.string(),
	updatedDate: z.coerce.date().optional(),
	emoji: z.string().optional(),
	heroImage: z.string().optional(),
	repository: z.string(),
	url: z.string().optional(),
	published: z.boolean(),
})

const project = defineCollection({
	// Load Markdown and MDX files in the `src/content/project/` directory.
	loader: glob({ base: './src/content/project', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: projectSchema,
});

export const collections = { project };

export type Project = z.infer<typeof projectSchema>;


