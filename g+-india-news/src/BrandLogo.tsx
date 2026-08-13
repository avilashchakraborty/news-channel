import React, { useId } from "react";

// G+ India News brand logo, recreated as scalable SVG to match the 3D metallic
// mark: glossy red "G", silver "+", "INDIA" in brushed silver, "NEWS" in red
// between dashes. BrandMark is the compact G+ glyph (headers/favicon);
// BrandLockup is the full stacked lockup (sign-in / hero).

const G_PATH =
  "M 75.7 16.3 A 42 42 0 1 0 88 46 H 46 V 32 H 88 V 50 A 42 42 0 0 1 75.7 75.7 C 67.7 83.7 57.3 88 46 88 C 22.8 88 4 69.2 4 46 C 4 22.8 22.8 4 46 4 C 57.3 4 67.7 8.3 75.7 16.3 Z";
const PLUS_PATH = "M 88 30 H 104 V 50 H 120 V 66 H 104 V 86 H 88 V 66 H 72 V 50 H 88 Z";

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff4a4e" />
        <stop offset="0.5" stopColor="#e01b22" />
        <stop offset="1" stopColor="#8d0c11" />
      </linearGradient>
      <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#d2d7dd" />
        <stop offset="1" stopColor="#868c95" />
      </linearGradient>
    </defs>
  );
}

export function BrandMark({ height = 34, style }: { height?: number; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg height={height} viewBox="0 0 124 92" fill="none" role="img" aria-label="G+ India News" style={style}>
      <Defs id={id} />
      <path d={G_PATH} fill={`url(#${id}r)`} stroke="#ffc9cb" strokeOpacity="0.45" strokeWidth="1.3" />
      <path d={PLUS_PATH} fill={`url(#${id}s)`} stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
    </svg>
  );
}

export function BrandLockup({
  height = 120,
  onDark = true,
  style,
}: {
  height?: number;
  onDark?: boolean;
  style?: React.CSSProperties;
}) {
  const id = useId().replace(/:/g, "");
  const silver = `url(#${id}s)`;
  const indiaFill = onDark ? silver : "#20242a";
  const dash = onDark ? "#e01b22" : "#e01b22";
  return (
    <svg height={height} viewBox="0 0 168 154" fill="none" role="img" aria-label="G+ India News" style={style}>
      <Defs id={id} />
      <g transform="translate(26,2)">
        <path d={G_PATH} fill={`url(#${id}r)`} stroke="#ffc9cb" strokeOpacity="0.45" strokeWidth="1.3" />
        <path d={PLUS_PATH} fill={silver} stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
      </g>
      <text
        x="84"
        y="122"
        textAnchor="middle"
        fontFamily="Archivo, sans-serif"
        fontWeight="800"
        fontSize="27"
        letterSpacing="0.16em"
        fill={indiaFill}
      >
        INDIA
      </text>
      <line x1="34" y1="140" x2="58" y2="140" stroke={dash} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="110" y1="140" x2="134" y2="140" stroke={dash} strokeWidth="2.4" strokeLinecap="round" />
      <text
        x="84"
        y="145"
        textAnchor="middle"
        fontFamily="Archivo, sans-serif"
        fontWeight="700"
        fontSize="14"
        letterSpacing="0.34em"
        fill="#e01b22"
      >
        NEWS
      </text>
    </svg>
  );
}
