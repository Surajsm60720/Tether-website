import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).sort((a, b) => a.data.order - b.data.order);
  const site = 'https://tether.app';

  const pages = await Promise.all(
    docs.map(async (doc) => {
      const { headings } = await render(doc);
      const path = doc.id === 'index' ? '/docs' : `/docs/${doc.id}`;
      return {
        id: doc.id === 'index' ? 'index' : doc.id,
        title: doc.data.title,
        description: doc.data.description,
        section: doc.data.section,
        order: doc.data.order,
        url: `${site}${path}`,
        headings: headings
          .filter((h) => h.depth >= 2 && h.depth <= 3)
          .map((h) => ({
            depth: h.depth,
            slug: h.slug,
            text: h.text,
            url: `${site}${path}#${h.slug}`,
          })),
      };
    }),
  );

  const payload = {
    name: 'Tether Docs',
    description:
      'Product help for Tether: Mac host + iPhone client. Local pairing, files, terminal, agents, Tailscale remote, and lid-closed awake.',
    url: `${site}/docs`,
    llms: `${site}/llms.txt`,
    updated: new Date().toISOString().slice(0, 10),
    pages,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
