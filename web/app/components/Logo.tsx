"use client";

import { useState } from "react";

// Uses /logo.png when present, otherwise the bundled /logo.svg recreation.
export function LogoImg({ height = 44 }: { height?: number }) {
  const [src, setSrc] = useState("/logo.png");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="G Plus India News"
      onError={() => {
        if (src !== "/logo.svg") setSrc("/logo.svg");
      }}
      style={{ height, width: "auto", display: "block" }}
    />
  );
}
