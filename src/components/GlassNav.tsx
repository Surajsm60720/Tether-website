import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LiquidGlass } from 'apple-liquid-glass-webgl';
import GlassSurface from './reactbits/GlassSurface';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  resolveTheme,
  themeIconSrc,
  type ThemeId,
} from '../lib/themes';

export type GlassNavLink = {
  href: string;
  label: string;
  current?: boolean;
};

type Props = {
  pathname: string;
  links: GlassNavLink[];
};

/** Chromium-only: SVG displacement through backdrop-filter. */
function supportsSvgRefraction() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const ua = navigator.userAgent;
  const isWebkit = /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isWebkit || isFirefox) return false;

  const div = document.createElement('div');
  div.style.backdropFilter = 'url(#glass-probe)';
  return div.style.backdropFilter.includes('url(');
}

function currentThemeId(): ThemeId {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  return resolveTheme(document.documentElement.dataset.theme || localStorage.getItem(THEME_STORAGE_KEY));
}

function NavInner({ links }: { links: GlassNavLink[] }) {
  const [markSrc, setMarkSrc] = useState(() => themeIconSrc(DEFAULT_THEME));

  useEffect(() => {
    const sync = (id?: ThemeId) => setMarkSrc(themeIconSrc(id ?? currentThemeId()));
    sync();
    const onTheme = (event: Event) => {
      const detail = (event as CustomEvent<{ theme: ThemeId }>).detail;
      sync(detail?.theme);
    };
    document.addEventListener('tether:theme', onTheme);
    return () => document.removeEventListener('tether:theme', onTheme);
  }, []);

  return (
    <div className="glass-nav-inner">
      <a className="glass-nav-brand" href="/" aria-label="Tether home">
        <img
          className="glass-nav-mark"
          data-brand-mark
          src={markSrc}
          alt=""
          width={28}
          height={28}
          decoding="async"
        />
        Tether
      </a>

      <nav className="glass-nav-links" aria-label="Primary">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={link.current ? 'page' : undefined}
            className={link.current ? 'is-current' : undefined}
          >
            {link.label}
          </a>
        ))}
        <a
          className="glass-nav-github"
          href="https://github.com/Surajsm60720/Tether"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </nav>

      <a className="glass-nav-cta" href="/download">
        Get Tether
      </a>
    </div>
  );
}

function WebglGlassShell({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !LiquidGlass.isSupported()) return;

    const glass = new LiquidGlass(el, {
      backdrop: 'auto',
      tint: 0.55,
      tintTone: 'dark',
      frost: 0.38,
      shape: 'pill',
      radius: 38,
      material: {
        refraction: 36,
        dispersion: 0.55,
        edgeReach: 0.08,
        edgeWidth: 0.14,
        rim: 0.16,
        reflection: 0.1,
        highlight: 0.14,
        hairline: 0.45,
        body: 0.45,
        absorption: 0.28,
      },
      respectReducedTransparency: true,
      live: 'auto',
      maxDpr: 1.25,
    });

    return () => glass.destroy();
  }, [enabled]);

  return (
    <div
      ref={ref}
      className="glass-nav-surface glass-nav-webgl"
      style={{
        width: '100%',
        height: 76,
        borderRadius: 38,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

export default function GlassNav({ links }: Props) {
  const [refraction, setRefraction] = useState(true);
  const [engine, setEngine] = useState<'svg' | 'webgl'>('webgl');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-transparency: reduce)');
    const apply = () => setRefraction(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    // Prefer WebGL everywhere it works — Safari/Firefox never get SVG refraction.
    // Fall back to React Bits SVG path only when WebGL2 is missing but Chromium SVG works.
    if (LiquidGlass.isSupported()) {
      setEngine('webgl');
    } else if (supportsSvgRefraction()) {
      setEngine('svg');
    } else {
      setEngine('webgl');
    }
  }, []);

  return (
    <div className="glass-nav-shell">
      {engine === 'svg' ? (
        <GlassSurface
          width="100%"
          height={76}
          borderRadius={38}
          borderWidth={0.07}
          brightness={28}
          opacity={0.9}
          blur={12}
          displace={0.5}
          backgroundOpacity={0.22}
          saturation={1.05}
          distortionScale={-120}
          redOffset={0}
          greenOffset={8}
          blueOffset={14}
          refraction={refraction}
          renderer="auto"
          className="glass-nav-surface"
        >
          <NavInner links={links} />
        </GlassSurface>
      ) : (
        <WebglGlassShell enabled={refraction}>
          <NavInner links={links} />
        </WebglGlassShell>
      )}
    </div>
  );
}
