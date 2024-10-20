import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.nandanvarma.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://www.nandanvarma.com/projects',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.nandanvarma.com/contact',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    // {
    //   url: 'https://www.nandanvarma.com/projects/music',
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.4,
    // },
  ]
}