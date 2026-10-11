import {
  type CSSProperties,
  type ReactNode,
} from 'react';

type IPhoneModel = '14' | '14-pro' | '15' | '15-pro' | 'x' | 'plain';
type Orientation = 'portrait' | 'landscape';
type WallpaperFit = 'cover' | 'contain' | 'fill';

export interface IPhoneMockupProps {
  model?: IPhoneModel;
  color?:
    | 'black'
    | 'midnight'
    | 'silver'
    | 'starlight'
    | 'space-black'
    | 'gold'
    | 'blue'
    | 'pink'
    | 'titanium'
    | 'natural-titanium'
    | 'green'
    | 'red'
    | string;
  orientation?: Orientation;
  /** Visual scale. Layout box shrinks to match (unlike bare CSS transform). */
  scale?: number;
  /** Outer frame width in px — overrides scale so the mock fits a slot. */
  width?: number;

  bezel?: number;
  radius?: number;
  shadow?: boolean | string;

  screenBg?: string;
  wallpaper?: string;
  wallpaperFit?: WallpaperFit;
  wallpaperPosition?: string;

  showDynamicIsland?: boolean;
  showNotch?: boolean;
  islandWidth?: number;
  islandHeight?: number;
  islandRadius?: number;
  notchWidth?: number;
  notchHeight?: number;
  notchRadius?: number;

  safeArea?: boolean;
  safeAreaOverrides?: Partial<{ top: number; bottom: number; left: number; right: number }>;

  showHomeIndicator?: boolean;
  homeIndicatorColor?: string;
  showSideButtons?: boolean;
  innerShadow?: boolean;

  /** Renders in the top status band (time / signal), above safe-area content. */
  statusBar?: ReactNode;

  /** Content inside the Dynamic Island cutout (e.g. Live Activity / status). */
  dynamicIsland?: ReactNode;

  style?: CSSProperties;
  className?: string;
  frameStyle?: CSSProperties;
  screenStyle?: CSSProperties;

  children?: ReactNode;
}

const DEVICE_SPECS: Record<
  IPhoneModel,
  {
    w: number;
    h: number;
    radius: number;
    bezel: number;
    topSafe: number;
    bottomSafe: number;
    notch?: { w: number; h: number; r: number };
    island?: { w: number; h: number; r: number };
  }
> = {
  x: {
    w: 375,
    h: 812,
    radius: 50,
    bezel: 12,
    topSafe: 47,
    bottomSafe: 34,
    notch: { w: 210, h: 35, r: 18 },
  },
  '14': {
    w: 390,
    h: 844,
    radius: 56,
    bezel: 12,
    topSafe: 47,
    bottomSafe: 34,
    notch: { w: 225, h: 33, r: 18 },
  },
  '14-pro': {
    w: 393,
    h: 852,
    radius: 56,
    bezel: 12,
    topSafe: 59,
    bottomSafe: 34,
    island: { w: 126, h: 37, r: 20 },
  },
  '15': {
    w: 393,
    h: 852,
    radius: 56,
    bezel: 12,
    topSafe: 59,
    bottomSafe: 34,
    island: { w: 126, h: 37, r: 20 },
  },
  '15-pro': {
    w: 393,
    h: 852,
    radius: 56,
    bezel: 12,
    topSafe: 59,
    bottomSafe: 34,
    island: { w: 126, h: 37, r: 20 },
  },
  plain: {
    w: 390,
    h: 844,
    radius: 56,
    bezel: 12,
    topSafe: 16,
    bottomSafe: 16,
  },
};

const PRESET_COLORS: Record<string, string> = {
  black: '#0b0b0d',
  midnight: '#0b0c10',
  silver: '#d7d8dc',
  starlight: '#f1eee9',
  'space-black': '#1c1e22',
  gold: '#f2dfb3',
  blue: '#2b4fa8',
  pink: '#ffbfd1',
  titanium: '#837a72',
  'natural-titanium': '#a69a8a',
  green: '#2b622e',
  red: '#c81f2f',
};

function shade(hex: string, pct: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  const k = (100 + pct) / 100;
  const to = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `#${to(r).toString(16).padStart(2, '0')}${to(g).toString(16).padStart(2, '0')}${to(b).toString(16).padStart(2, '0')}`;
}

export function IPhoneMockup({
  model = '14-pro',
  color = 'space-black',
  orientation = 'portrait',
  scale: scaleProp = 1,
  width: widthProp,

  bezel,
  radius,
  shadow = true,

  screenBg = '#000',
  wallpaper,
  wallpaperFit = 'cover',
  wallpaperPosition = 'center',

  showDynamicIsland,
  showNotch,
  islandWidth,
  islandHeight,
  islandRadius,
  notchWidth,
  notchHeight,
  notchRadius,

  safeArea = true,
  safeAreaOverrides,

  showHomeIndicator = true,
  homeIndicatorColor,
  showSideButtons = true,
  innerShadow = true,

  statusBar,
  dynamicIsland,

  style,
  className,
  frameStyle,
  screenStyle,

  children,
}: IPhoneMockupProps) {
  const spec = DEVICE_SPECS[model];
  const W = spec.w;
  const H = spec.h;

  const useIsland = typeof showDynamicIsland === 'boolean' ? showDynamicIsland : Boolean(spec.island);
  const useNotch = typeof showNotch === 'boolean' ? showNotch : Boolean(spec.notch) && !useIsland;

  const resolvedRadius = radius ?? spec.radius;
  const resolvedBezel = bezel ?? spec.bezel;

  const isLandscape = orientation === 'landscape';
  const screenWidth = isLandscape ? H : W;
  const screenHeight = isLandscape ? W : H;

  const outerWidth = screenWidth + resolvedBezel * 2;
  const outerHeight = screenHeight + resolvedBezel * 2;
  const outerRadius = resolvedRadius + resolvedBezel;

  const scale = widthProp != null ? widthProp / outerWidth : scaleProp;

  const colorHex = PRESET_COLORS[color] ?? color;
  const frameGradient = `linear-gradient(145deg, ${shade(colorHex, 18)} 0%, ${shade(colorHex, 4)} 22%, ${colorHex} 48%, ${shade(colorHex, -10)} 72%, ${shade(colorHex, -22)} 100%)`;

  const outerShadow =
    typeof shadow === 'string'
      ? shadow
      : shadow
        ? '0 28px 50px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.22)'
        : 'none';

  const innerShadowCss = innerShadow
    ? 'inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 0 1.5px rgba(0,0,0,0.55)'
    : 'none';

  const notchSpec = spec.notch;
  const islandSpec = spec.island;

  const finalNotchW = notchWidth ?? notchSpec?.w ?? 0;
  const finalNotchH = notchHeight ?? notchSpec?.h ?? 0;
  const finalNotchR = notchRadius ?? notchSpec?.r ?? 0;

  const finalIslandW = islandWidth ?? islandSpec?.w ?? 0;
  const finalIslandH = islandHeight ?? islandSpec?.h ?? 0;
  const finalIslandR = islandRadius ?? islandSpec?.r ?? Math.round(finalIslandH / 2);

  const insets = {
    top: safeAreaOverrides?.top ?? spec.topSafe,
    bottom: safeAreaOverrides?.bottom ?? spec.bottomSafe,
    left: safeAreaOverrides?.left ?? 16,
    right: safeAreaOverrides?.right ?? 16,
  };

  const wrapperStyle: CSSProperties = {
    boxSizing: 'border-box',
    display: 'block',
    width: outerWidth * scale,
    height: outerHeight * scale,
    position: 'relative',
    ...style,
  };

  const scaleBoxStyle: CSSProperties = {
    width: outerWidth,
    height: outerHeight,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const frameBoxStyle: CSSProperties = {
    width: outerWidth,
    height: outerHeight,
    borderRadius: outerRadius,
    background: frameGradient,
    padding: resolvedBezel,
    boxSizing: 'border-box',
    boxShadow: outerShadow,
    position: 'relative',
    ...frameStyle,
  };

  const screenBoxStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: resolvedRadius,
    position: 'relative',
    overflow: 'hidden',
    background: screenBg,
    boxShadow: innerShadowCss,
    ...screenStyle,
  };

  const wallpaperStyle: CSSProperties | undefined = wallpaper
    ? {
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: wallpaperFit,
        backgroundPosition: wallpaperPosition,
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }
    : undefined;

  const cutoutCommon: CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#000',
    zIndex: 4,
  };

  const homeIndicatorStyle: CSSProperties = {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: Math.round(screenWidth * 0.34),
    maxWidth: 140,
    height: 5,
    borderRadius: 3,
    background: homeIndicatorColor ?? 'rgba(0,0,0,0.55)',
    zIndex: 5,
    pointerEvents: 'none',
  };

  const contentStyle: CSSProperties = safeArea
    ? {
        position: 'absolute',
        top: insets.top,
        right: insets.right,
        bottom: insets.bottom,
        left: insets.left,
        overflow: 'hidden',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      };

  const btnColor = shade(colorHex, -8);
  const btnHi = shade(colorHex, 12);

  return (
    <div className={className} style={wrapperStyle} data-device="phone">
      <div style={scaleBoxStyle}>
        <div style={frameBoxStyle} aria-label={`iPhone mockup (${model})`}>
          {showSideButtons && !isLandscape && (
            <>
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: -2.5,
                  top: '20.5%',
                  width: 3,
                  height: '3.6%',
                  borderRadius: '1.5px 0 0 1.5px',
                  background: `linear-gradient(90deg, ${btnHi}, ${btnColor})`,
                }}
              />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: -2.5,
                  top: '32%',
                  width: 3,
                  height: '6.5%',
                  borderRadius: '1.5px 0 0 1.5px',
                  background: `linear-gradient(90deg, ${btnHi}, ${btnColor})`,
                }}
              />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: -2.5,
                  top: '40.5%',
                  width: 3,
                  height: '6.5%',
                  borderRadius: '1.5px 0 0 1.5px',
                  background: `linear-gradient(90deg, ${btnHi}, ${btnColor})`,
                }}
              />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  right: -2.5,
                  top: '29%',
                  width: 3,
                  height: '11.5%',
                  borderRadius: '0 1.5px 1.5px 0',
                  background: `linear-gradient(270deg, ${btnHi}, ${btnColor})`,
                }}
              />
            </>
          )}

          <div style={screenBoxStyle}>
            {wallpaper && <div aria-hidden style={wallpaperStyle} />}

            {useIsland && finalIslandW > 0 && finalIslandH > 0 && (
              <>
                {/* Idle hardware cutout — always present at the real camera position */}
                <div
                  aria-hidden
                  className="iphone-dynamic-island"
                  style={{
                    ...cutoutCommon,
                    top: 11,
                    zIndex: dynamicIsland ? 7 : 4,
                    width: finalIslandW,
                    height: finalIslandH,
                    borderRadius: finalIslandR,
                  }}
                />
                {dynamicIsland && (
                  <div
                    className="iphone-dynamic-island is-live"
                    style={{
                      ...cutoutCommon,
                      top: 11,
                      zIndex: 6,
                      /* Tight expand so battery still fits on the status bar */
                      width: finalIslandW + 136,
                      height: finalIslandH,
                      borderRadius: finalIslandR,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 8px',
                      boxSizing: 'border-box',
                      background: '#000',
                    }}
                  >
                    {dynamicIsland}
                  </div>
                )}
              </>
            )}

            {!useIsland && useNotch && finalNotchW > 0 && finalNotchH > 0 && (
              <div
                aria-hidden
                style={{
                  ...cutoutCommon,
                  top: 8,
                  width: finalNotchW,
                  height: finalNotchH,
                  borderRadius: finalNotchR,
                }}
              />
            )}

            {statusBar && (
              <div
                className="iphone-status-bar"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: insets.top,
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
              >
                {statusBar}
              </div>
            )}

            <div style={contentStyle}>{children}</div>

            {showHomeIndicator && <div aria-hidden style={homeIndicatorStyle} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IPhoneMockup;
