import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).sort((a, b) => a.data.order - b.data.order);
  const site = 'https://tether.app';

  const lines = [
    '# Tether',
    '',
    '> Your Mac. On your iPhone. Local by design — browse shared folders, send files, run a scoped terminal and allowlisted agents, without a cloud account.',
    '',
    'Pair once on Wi‑Fi. Away from home, use Tailscale (recommended), a relay, or a port forward. Optional lid-closed awake keeps a MacBook reachable with the lid shut.',
    '',
    '## Docs',
    '',
  ];

  for (const doc of docs) {
    const path = doc.id === 'index' ? '/docs' : `/docs/${doc.id}`;
    lines.push(`- [${doc.data.title}](${site}${path}): ${doc.data.description}`);
  }

  lines.push(
    '',
    '## Machine-readable index',
    '',
    `- [${site}/docs.json](${site}/docs.json): JSON catalog of every docs page (id, title, description, section, url, headings)`,
    '',
    '## Optional',
    '',
    `- [Journey](${site}/journey): product milestones`,
    `- [Get Tether](${site}/download): build Host + Client from source`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
