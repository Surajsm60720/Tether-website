/** Matches Tether app AppearancePresets (Gold / Blue / Green / Neutral / Midnight). */
export const THEME_IDS = ['gold', 'blue', 'green', 'neutral', 'midnight'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = 'gold';

export const THEME_STORAGE_KEY = 'tether-theme';

export const THEMES: {
  id: ThemeId;
  name: string;
  swatch: string;
  icon: string;
}[] = [
  { id: 'gold', name: 'Gold', swatch: '#E8B04A', icon: '/images/icons/gold.png' },
  { id: 'blue', name: 'Blue', swatch: '#5B9DFF', icon: '/images/icons/blue.png' },
  { id: 'green', name: 'Green', swatch: '#3DCF8E', icon: '/images/icons/green.png' },
  { id: 'neutral', name: 'Neutral', swatch: '#8E8E93', icon: '/images/icons/neutral.png' },
  { id: 'midnight', name: 'Midnight', swatch: '#F2C970', icon: '/images/icons/midnight.png' },
];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return !!value && (THEME_IDS as readonly string[]).includes(value);
}

export function resolveTheme(value: string | null | undefined): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME;
}

export function themeIconSrc(id: ThemeId): string {
  return THEMES.find((t) => t.id === id)?.icon ?? THEMES[0].icon;
}

export function themeColorMeta(id: ThemeId): string {
  return id === 'midnight' ? '#0B0D10' : '#0E1013';
}

type ApplyOptions = {
  /** Keep the viewport put after token/icon updates (user theme changes). */
  preserveScroll?: boolean;
};

/** Sync chrome tokens + brand marks. */
export function applyTheme(id: ThemeId, options: ApplyOptions = {}) {
  const preserveScroll = options.preserveScroll === true;
  const y = typeof window !== 'undefined' ? window.scrollY : 0;

  document.documentElement.dataset.theme = id;
  if (document.body) document.body.dataset.theme = id;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', themeColorMeta(id));

  const icon = themeIconSrc(id);
  document.querySelectorAll<HTMLImageElement>('[data-brand-mark]').forEach((img) => {
    if (img.getAttribute('src') !== icon) img.setAttribute('src', icon);
  });

  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"][data-theme-icon]');
  if (favicon && favicon.getAttribute('href') !== icon) {
    const next = favicon.cloneNode(true) as HTMLLinkElement;
    next.href = icon;
    favicon.replaceWith(next);
  }

  const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"][data-theme-apple-icon]');
  if (apple && apple.getAttribute('href') !== icon) {
    apple.setAttribute('href', icon);
  }

  document.dispatchEvent(new CustomEvent('tether:theme', { detail: { theme: id } }));

  if (preserveScroll && typeof window !== 'undefined') {
    window.scrollTo(0, y);
    requestAnimationFrame(() => window.scrollTo(0, y));
  }
}
