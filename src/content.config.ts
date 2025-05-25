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

const blogSchema = z.object({
	title: z.string(),
	description: z.string(),
	// Transform string to Date object
	date: z.string(),
	updatedDate: z.coerce.date().optional(),
	draft: z.boolean().optional()
})

const project = defineCollection({
	// Load Markdown and MDX files in the `src/content/project/` directory.
	loader: glob({ base: './src/content/project', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: projectSchema,
});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: blogSchema
})

export const collections = { project, blog };

export type Project = z.infer<typeof projectSchema>;
export type Blog = z.infer<typeof blogSchema>;


