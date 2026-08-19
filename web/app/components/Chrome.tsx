import Link from "next/link";
import { REGIONS, CATEGORIES, CHIPS } from "../lib/types";
import { LogoImg } from "./Logo";

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
        <Link href="/" className="brand" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <LogoImg height={40} />
          <span style={{ fontSize: 10, fontWeight: 700, fontStyle: "italic", color: "var(--brand)", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
            Sach Ka Saamna, Sach Ke Sath
          </span>
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
