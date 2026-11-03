// Adapted from React Bits (https://reactbits.dev), © David Haz.
// MIT + Commons Clause: fine to use inside an app or site, but not to sell or
// redistribute the component on its own. Full notice in CREDITS.md.

import React, { useEffect, useState } from "react";

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B";
  yChannel?: "R" | "G" | "B";
  mixBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity"
    | "plus-darker"
    | "plus-lighter";
  className?: string;
  style?: React.CSSProperties;
}

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isDark;
};

/**
 * Frosted iOS material.
 *
 * The original React Bits implementation used an SVG displacement map as a
 * backdrop-filter to fake liquid glass. On large, always-moving surfaces (the
 * home-screen dock especially) Chromium rasterises the RGB displacement pass
 * incorrectly and leaks rainbow fringes, so this version keeps the same API
 * and uses a clean backdrop blur + specular edge instead. It is cheaper, stable
 * on every browser, and closer to the real system material.
 */
const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  blur = 20,
  backgroundOpacity = 0,
  saturation = 1.6,
  className = "",
  style = {},
}) => {
  const isDarkMode = useDarkMode();

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        ...style,
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: `${borderRadius}px`,
        background: isDarkMode
          ? `rgba(0, 0, 0, ${backgroundOpacity})`
          : `rgba(255, 255, 255, ${backgroundOpacity})`,
        backdropFilter: `blur(${blur}px) saturate(${saturation})`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation})`,
        boxShadow: isDarkMode
          ? "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.18)"
          : "inset 0 0 0 1px rgba(255,255,255,0.28), inset 0 1px 0 rgba(255,255,255,0.42)",
      }}
    >
      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[inherit] p-2">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
