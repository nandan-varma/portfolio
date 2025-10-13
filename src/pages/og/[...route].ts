import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

// Get all blog posts and projects
const blogEntries = await getCollection('blog');
const projectEntries = await getCollection('project');

// Create pages object for both collections and main pages
const pages = {
    // Add main pages
    'index': {
        title: 'Nandan Varma',
        description: 'A Software Developer passionate about building amazing things',
        type: 'page'
    },
    'contact': {
        title: 'Contact - Nandan Varma',
        description: 'Get in touch with me',
        type: 'page'
    },
    'projects': {
        title: 'Projects - Nandan Varma',
        description: 'Explore my projects',
        type: 'page'
    },
    'blog': {
        title: 'Blog - Nandan Varma',
        description: 'Read my blog posts',
        type: 'page'
    },
    // Add blog posts with blog/ prefix
    ...Object.fromEntries(
        blogEntries.map(({ id, data }: any) => [`blog/${id}`, { ...data, type: 'blog' }])
    ),
    // Add projects with project/ prefix
    ...Object.fromEntries(
        projectEntries.map(({ id, data }: any) => [`project/${id}`, { ...data, type: 'project' }])
    ),
};

export const { getStaticPaths, GET } = OGImageRoute({
    param: 'route',
    pages: pages,
    getImageOptions: (path, page) => ({
        title: page.title,
        description: page.description,
        logo: {
            path: './public/favicon.png',
            size: [80, 80]
        },
        bgGradient: [
            [255, 255, 255],
            [200, 200, 200],
            [150, 150, 150],
        ],
        border: {
            color: [255, 255, 255], // white border
            width: 2,
            side: 'inline-start'
        },
        font: {
            title: {
                color: [0, 0, 0],
                size: 80,
                weight: 'ExtraBold',
                lineHeight: 2.5,
            },
            description: {
                color: [0, 0, 0],
                size: 48,
                weight: 'Normal',
                lineHeight: 1.5,
            }
        },
        padding: 80,
    }),
});
