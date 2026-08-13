import Link from "next/link";
import { REGIONS, CATEGORIES, CHIPS } from "../lib/types";

const TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "gplus";
const STATES = new Set(["West Bengal", "Bihar", "Jharkhand", "Delhi", "National"]);

function regionHref(r: string): string {
  if (STATES.has(r)) return `/${TENANT}/state/${slug(r === "National" ? "India" : r)}`;
  return `/${TENANT}/district/${slug(r)}`;
}

export function Header({ active }: { active?: string }) {
  return (
    <header className="header">
      <div className="wrap header-row">
        <Link href="/" className="brand">
          <BrandMark />
          <span>India News</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="cta">Install App</button>
        </div>
      </div>
      <nav className="wrap nav" aria-label="Regions">
        <Link href="/" className={active ? "" : "on"}>
          HOME
        </Link>
        {REGIONS.map((r) => (
          <Link key={r} href={regionHref(r)} className={active === r ? "on" : ""}>
            {r}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Chips({ active }: { active?: string }) {
  return (
    <div className="chips" aria-label="Topics">
      {CHIPS.map((c) => (
        <Link key={c} href={`/${TENANT}/tag/${slug(c)}`} className={`chip${active === c ? " on" : ""}`}>
          {c}
        </Link>
      ))}
    </div>
  );
}

export function Tiles() {
  return (
    <div className="tiles" aria-label="Services">
      {CATEGORIES.map((c) => (
        <div key={c.label} className="tile">
          <div className="ic" style={{ background: c.bg }}>
            {c.emoji}
          </div>
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-row wrap">
        <span>© 2026 G+ India News · Hyperlocal district video news</span>
        <div className="links">
          <span>About</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>
    </footer>
  );
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}

// G+ mark (matches the brand logo). Fixed gradient ids — rendered once per page.
export function BrandMark() {
  return (
    <svg height={34} viewBox="0 0 124 92" fill="none" role="img" aria-label="G+ India News">
      <defs>
        <linearGradient id="bm-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff4a4e" />
          <stop offset="0.5" stopColor="#e01b22" />
          <stop offset="1" stopColor="#8d0c11" />
        </linearGradient>
        <linearGradient id="bm-s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#d2d7dd" />
          <stop offset="1" stopColor="#868c95" />
        </linearGradient>
      </defs>
      <path
        d="M 75.7 16.3 A 42 42 0 1 0 88 46 H 46 V 32 H 88 V 50 A 42 42 0 0 1 75.7 75.7 C 67.7 83.7 57.3 88 46 88 C 22.8 88 4 69.2 4 46 C 4 22.8 22.8 4 46 4 C 57.3 4 67.7 8.3 75.7 16.3 Z"
        fill="url(#bm-r)"
        stroke="#ffc9cb"
        strokeOpacity="0.45"
        strokeWidth="1.3"
      />
      <path d="M 88 30 H 104 V 50 H 120 V 66 H 104 V 86 H 88 V 66 H 72 V 50 H 88 Z" fill="url(#bm-s)" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
    </svg>
  );
}
