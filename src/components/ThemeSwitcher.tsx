import { useEffect, useId, useRef, useState } from 'react';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  THEMES,
  applyTheme,
  resolveTheme,
  type ThemeId,
} from '../lib/themes';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const saved = resolveTheme(localStorage.getItem(THEME_STORAGE_KEY));
    setTheme(saved);
    // Initial sync only — do not touch scroll (browser restore / hash handle that).
    applyTheme(saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function select(id: ThemeId) {
    setTheme(id);
    localStorage.setItem(THEME_STORAGE_KEY, id);
    applyTheme(id, { preserveScroll: true });
    setOpen(false);
    rootRef.current?.querySelector<HTMLButtonElement>('.theme-switcher-trigger')?.focus({
      preventScroll: true,
    });
  }

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="theme-switcher" ref={rootRef}>
      <button
        type="button"
        className="theme-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Appearance: ${current.name}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="theme-switcher-disk" style={{ background: current.swatch }} />
        <span className="theme-switcher-current">{current.name}</span>
        <span className="theme-switcher-caret" aria-hidden="true" />
      </button>

      {open ? (
        <div className="theme-palette" id={listId} role="listbox" aria-label="Appearance">
          <p className="theme-palette-title">Appearance</p>
          <div className="theme-palette-row">
            {THEMES.map((item) => {
              const selected = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`theme-swatch${selected ? ' is-selected' : ''}`}
                  onClick={() => select(item.id)}
                  title={item.name}
                >
                  <span className="theme-swatch-disk" style={{ background: item.swatch }} />
                  <span className="theme-swatch-name">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
