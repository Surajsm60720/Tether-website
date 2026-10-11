# Tether website

Marketing site and docs for Tether.

Product guidelines: [`../Tether/docs/WEB_DESIGN.md`](../Tether/docs/WEB_DESIGN.md) (companion to app `DESIGN.md` / `PRD.md`).

## Develop

```bash
cd Tether-website
npm install
npm run dev
```

## Build

```bash
npm run build   # astro build + pagefind index
npm run preview
```

Stack: Astro + MDX content collections. Progressive enhancement; no marketing SPA.
