import CircularText from './reactbits/CircularText';

/** Letters travel along the Tether infinity / inverted-8 path. */
export default function HeroLoop() {
  return (
    <div className="hero-loop">
      <CircularText
        text="TETHER · TETHER · TETHER · TETHER · "
        path="infinity"
        pathScale={148}
        width="100%"
        height="100%"
        spinDuration={36}
        onHover="speedUp"
        className="hero-loop-text"
      />
    </div>
  );
}
