const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Sticky path scroll progress with damped lerp */
function initStickyPaths() {
  const scenes = document.querySelectorAll<HTMLElement>('[data-sticky-path]');
  if (!scenes.length) return;

  type SceneState = {
    el: HTMLElement;
    progressEl: HTMLElement | null;
    steps: HTMLElement[];
    frames: HTMLElement[];
    target: number;
    current: number;
  };

  const states: SceneState[] = [...scenes].map((el) => ({
    el,
    progressEl: el.querySelector<HTMLElement>('[data-path-progress] span'),
    steps: [...el.querySelectorAll<HTMLElement>('[data-path-step]')],
    frames: [...el.querySelectorAll<HTMLElement>('[data-path-frame]')],
    target: 0,
    current: 0,
  }));

  function measure(state: SceneState) {
    const track = state.el.parentElement?.classList.contains('path-pin')
      ? state.el.parentElement
      : state.el;
    const rect = track.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight);
    const traveled = clamp(-rect.top, 0, total);
    state.target = traveled / total;
  }

  function apply(state: SceneState) {
    const p = state.current;
    if (state.progressEl) state.progressEl.style.width = `${p * 100}%`;

    const count = Math.max(state.steps.length, 1);
    const idx = Math.min(count - 1, Math.floor(p * count));
    state.steps.forEach((step, i) => step.classList.toggle('is-active', i === idx));
    state.frames.forEach((frame, i) => {
      frame.style.opacity = i === idx ? '1' : '0';
      frame.style.position = i === 0 ? 'relative' : 'absolute';
      if (i > 0) {
        frame.style.inset = '0';
        frame.style.margin = 'auto';
      }
    });
  }

  function onScroll() {
    states.forEach(measure);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (reduceMotion) {
    states.forEach((s) => {
      s.current = s.target;
      apply(s);
    });
    return;
  }

  function tick() {
    for (const state of states) {
      state.current = lerp(state.current, state.target, 0.12);
      apply(state);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/** Setup steps reveal on scroll */
function initSetupSteps() {
  const steps = document.querySelectorAll<HTMLElement>('[data-setup-step]');
  if (!steps.length) return;

  if (reduceMotion) {
    steps.forEach((s) => s.classList.add('is-active'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        }
      }
    },
    { threshold: 0.55 },
  );
  steps.forEach((s) => io.observe(s));
}

/** Staggered reveal for Get Tether (and any [data-reveal] blocks) */
function initReveals() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const sections = document.querySelectorAll<HTMLElement>('[data-reveal-section]');

  if (reduceMotion) {
    nodes.forEach((el) => el.classList.add('is-revealed'));
    sections.forEach((el) => el.classList.add('is-inview'));
    return;
  }

  if (nodes.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.28, rootMargin: '0px 0px -8% 0px' },
    );
    nodes.forEach((el) => io.observe(el));
  }

  if (sections.length) {
    const sio = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-inview');
          sio.unobserve(entry.target);
        }
      },
      { threshold: 0.35 },
    );
    sections.forEach((el) => sio.observe(el));
  }
}

initStickyPaths();
initSetupSteps();
initReveals();
