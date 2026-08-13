import React, { useState } from "react";

// The G Plus India News logo.
// Uses /logo.png when present — drop the exact artwork at
// g+-india-news/public/logo.png and it is picked up automatically — otherwise
// falls back to the bundled /logo.svg recreation.
// On dark surfaces pass `chip` so the logo sits on a light rounded background
// (the logo's navy elements need a light backdrop to read).
export function LogoImage({
  height = 40,
  chip = false,
  style,
}: {
  height?: number;
  chip?: boolean;
  style?: React.CSSProperties;
}) {
  const [src, setSrc] = useState("/logo.png");
  return (
    <img
      src={src}
      alt="G Plus India News"
      onError={() => {
        if (src !== "/logo.svg") setSrc("/logo.svg");
      }}
      style={{
        height,
        width: "auto",
        display: "block",
        objectFit: "contain",
        ...(chip ? { background: "#fff", borderRadius: "10px", padding: "6px" } : {}),
        ...style,
      }}
    />
  );
}

// Back-compat exports used across the app. On the dark app screens the logo
// sits on a light chip; the light portal uses LogoImage directly.
export function BrandMark({ height = 34, style }: { height?: number; style?: React.CSSProperties }) {
  return <LogoImage height={height} chip style={style} />;
}

export function BrandLockup({ height = 120, style }: { height?: number; onDark?: boolean; style?: React.CSSProperties }) {
  return <LogoImage height={height} chip style={style} />;
}
