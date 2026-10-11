'use client';

import { useEffect, useMemo, useState, type CSSProperties, type FC } from 'react';
import { animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react';

export interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: 'slowDown' | 'speedUp' | 'pause' | 'goBonkers';
  className?: string;
  /** Circle (React Bits default) or Tether infinity / inverted-8 path. */
  path?: 'circle' | 'infinity';
  /** Path radius scale for infinity mode (default 82). */
  pathScale?: number;
  /** Outer box size for infinity mode. */
  width?: number | string;
  height?: number | string;
}

/** Lemniscate of Bernoulli — same silhouette as the Tether app icon (horizontal ∞). */
function infinityPoint(t: number, scale: number) {
  const s = Math.sin(t);
  const c = Math.cos(t);
  const denom = 1 + s * s;
  return {
    x: (scale * c) / denom,
    y: (scale * s * c) / denom,
  };
}

type PathPoly = { x: number; y: number; len: number }[];

function buildInfinityPoly(scale: number, steps = 720): { poly: PathPoly; total: number } {
  const poly: PathPoly = [];
  let prev = infinityPoint(0, scale);
  let length = 0;
  poly.push({ x: prev.x, y: prev.y, len: 0 });

  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const p = infinityPoint(t, scale);
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    poly.push({ x: p.x, y: p.y, len: length });
    prev = p;
  }

  return { poly, total: length || 1 };
}

function sampleAt(poly: PathPoly, total: number, distance: number) {
  const target = ((distance % total) + total) % total;
  let j = 1;
  while (j < poly.length && poly[j].len < target) j += 1;
  const a = poly[j - 1];
  const b = poly[Math.min(j, poly.length - 1)];
  const span = b.len - a.len || 1;
  const u = (target - a.len) / span;
  const x = a.x + (b.x - a.x) * u;
  const y = a.y + (b.y - a.y) * u;
  const ahead = poly[Math.min(j + 3, poly.length - 1)];
  const angle = (Math.atan2(ahead.y - y, ahead.x - x) * 180) / Math.PI;
  return { x, y, angle };
}

function circleLetterStyle(i: number, count: number): CSSProperties {
  const rotationDeg = (360 / count) * i;
  const factor = Math.PI / count;
  const x = factor * i;
  const y = factor * i;
  const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;
  return { transform, WebkitTransform: transform };
}

const CircularText: FC<CircularTextProps> = ({
  text,
  spinDuration = 20,
  onHover = 'speedUp',
  className = '',
  path = 'circle',
  pathScale = 82,
  width = 260,
  height = 150,
}) => {
  const letters = useMemo(() => Array.from(text), [text]);
  const [duration, setDuration] = useState(spinDuration);
  const [paused, setPaused] = useState(false);
  const [bonkersScale, setBonkersScale] = useState(1);

  const circleRotate = useMotionValue(0);
  const progress = useMotionValue(0);
  const { poly, total } = useMemo(() => buildInfinityPoly(pathScale), [pathScale]);

  useEffect(() => {
    setDuration(spinDuration);
  }, [spinDuration]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      circleRotate.set(0);
      progress.set(0);
      return;
    }

    if (path === 'circle') {
      const controls = animate(circleRotate, [circleRotate.get(), circleRotate.get() + 360], {
        duration,
        ease: 'linear',
        repeat: Infinity,
      });
      return () => controls.stop();
    }

    if (paused) return;

    const start = progress.get();
    const controls = animate(progress, [start, start + 1], {
      duration,
      ease: 'linear',
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [path, duration, paused, circleRotate, progress, text]);

  const handleHoverStart = () => {
    if (!onHover) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    switch (onHover) {
      case 'slowDown':
        setPaused(false);
        setBonkersScale(1);
        setDuration(spinDuration * 2);
        break;
      case 'speedUp':
        setPaused(false);
        setBonkersScale(1);
        setDuration(spinDuration / 4);
        break;
      case 'pause':
        setPaused(true);
        setBonkersScale(1);
        break;
      case 'goBonkers':
        setPaused(false);
        setBonkersScale(0.88);
        setDuration(spinDuration / 20);
        break;
      default:
        setPaused(false);
        setBonkersScale(1);
        setDuration(spinDuration);
    }
  };

  const handleHoverEnd = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setPaused(false);
    setBonkersScale(1);
    setDuration(spinDuration);
  };

  if (path === 'infinity') {
    return (
      <motion.div
        className={`m-0 mx-auto relative font-black text-center cursor-pointer origin-center ${className}`}
        style={{ width, height, scale: bonkersScale }}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        aria-hidden="true"
      >
        {letters.map((letter, i) => (
          <InfinityLetter
            key={`${letter}-${i}`}
            letter={letter === '*' ? '·' : letter}
            index={i}
            count={letters.length}
            progress={progress}
            poly={poly}
            total={total}
          />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`m-0 mx-auto rounded-full w-[200px] h-[200px] relative font-black text-center cursor-pointer origin-center ${className}`}
      style={{ rotate: circleRotate, scale: bonkersScale }}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      aria-hidden="true"
    >
      {letters.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          className="absolute inline-block inset-0 text-2xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
          style={circleLetterStyle(i, letters.length)}
        >
          {letter === '*' ? '·' : letter}
        </span>
      ))}
    </motion.div>
  );
};

function InfinityLetter({
  letter,
  index,
  count,
  progress,
  poly,
  total,
}: {
  letter: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  poly: PathPoly;
  total: number;
}) {
  const transform = useTransform(progress, (p) => {
    const distance = (index / count + p) * total;
    const { x, y, angle } = sampleAt(poly, total, distance);
    return `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`;
  });

  return (
    <motion.span
      className="absolute inline-block text-2xl will-change-transform"
      style={{
        left: '50%',
        top: '50%',
        transform,
      }}
    >
      {letter}
    </motion.span>
  );
}

export default CircularText;
