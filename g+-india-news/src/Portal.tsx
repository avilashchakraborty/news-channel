import React, { useState } from "react";

// ============================================================
// WEB PORTAL — public.app-style desktop news portal (light).
// This is the SEO/web surface: region nav, trending tags, quick
// links, and district/category sections of video cards. Data here
// is sample content; it maps 1:1 onto getFeed() when the backend
// is wired (each card => a published Video).
// ============================================================

const BRAND = "#E01B22";
const INK = "#111418";
const INK_SOFT = "#6B7280";
const LINE = "#E7E9EC";
const PANEL = "#FFFFFF";
const WASH = "#F6F7F9";

const REGIONS = [
  "Home",
  "Durgapur",
  "Asansol",
  "Kolkata",
  "Bardhaman",
  "Bankura",
  "Purulia",
  "West Bengal",
  "Bihar",
  "Jharkhand",
  "Delhi",
  "Uttar Pradesh",
  "Odisha",
  "Assam",
  "Maharashtra",
];

const TAGS = [
  "Public concern",
  "Breaking news",
  "Police",
  "Civic",
  "Politics",
  "Durgapur",
  "Weather",
  "Viral",
  "Accident",
  "Water crisis",
  "Municipality",
  "Sports",
  "Festival",
];

const CATEGORIES: { label: string; emoji: string; bg: string }[] = [
  { label: "Horoscope", emoji: "🔮", bg: "#1F2937" },
  { label: "Panchang", emoji: "📜", bg: "#B45309" },
  { label: "Commodities", emoji: "🧺", bg: "#F59E0B" },
  { label: "Fuel", emoji: "⛽", bg: "#16A34A" },
  { label: "Gold", emoji: "🥇", bg: "#CA8A04" },
  { label: "Weather", emoji: "⛅", bg: "#0EA5E9" },
  { label: "Jobs", emoji: "💼", bg: "#DC2626" },
  { label: "Electricity", emoji: "⚡", bg: "#EAB308" },
  { label: "Schemes", emoji: "🏛️", bg: "#0F7B5A" },
];

type Card = { headline: string; place: string; date: string };

const GRADIENTS = [
  "linear-gradient(135deg,#1B2A3D,#33506F)",
  "linear-gradient(135deg,#2E2340,#5B4A7A)",
  "linear-gradient(135deg,#10332C,#1F6B57)",
  "linear-gradient(135deg,#3D1F1F,#7A3B3B)",
  "linear-gradient(135deg,#3A2E12,#6E571F)",
  "linear-gradient(135deg,#122A3A,#255873)",
];

const SECTIONS: { title: string; cards: Card[] }[] = [
  {
    title: "Durgapur",
    cards: [
      { headline: "Road caves in near Durgapur Steel Plant, two-hour diversion in place", place: "Durgapur, Paschim Bardhaman", date: "Aug 10, 2026" },
      { headline: "Traders protest at Benachity market against new municipal levy", place: "Durgapur, Paschim Bardhaman", date: "Aug 10, 2026" },
      { headline: "সিটি সেন্টারে নতুন সরকারি হাসপাতাল ভবন চালু হচ্ছে আগামী মাসে", place: "City Centre, Durgapur", date: "Aug 9, 2026" },
      { headline: "Power cuts leave Muchipara residents stranded through the night", place: "Muchipara, Durgapur", date: "Aug 9, 2026" },
      { headline: "Water level rises at Durgapur Barrage after upstream rain", place: "Durgapur Barrage", date: "Aug 8, 2026" },
    ],
  },
  {
    title: "National",
    cards: [
      { headline: "On World Tribal Day, CM's big message to the youth with an assurance of jobs", place: "Jharkhand, India", date: "Aug 9, 2026" },
      { headline: "Kichha: clash between two groups during the Chehalum fair, sticks and stones fly", place: "Kichha, Udham Singh Nagar", date: "Aug 10, 2026" },
      { headline: "Students protesting against the JPSC were lathi-charged and tear-gassed", place: "Kanke, Ranchi", date: "Aug 10, 2026" },
      { headline: "Two plot sellers from Palwal sold fake plots to dozens over 150 km", place: "Palwal, Haryana", date: "Aug 8, 2026" },
      { headline: "74-year-old's faith remains intact as she continues the Sultanganj yatra", place: "Sultanganj, Bhagalpur", date: "Aug 9, 2026" },
    ],
  },
  {
    title: "Viral",
    cards: [
      { headline: "A unique initiative on Sawan Monday: the message of 'Tiranga in every home' echoes", place: "Rajnandgaon, Chhattisgarh", date: "Aug 10, 2026" },
      { headline: "Biscuits in hand, tap water: a smiling father staying hungry for his family", place: "Sadar, Lucknow", date: "Aug 10, 2026" },
      { headline: "Assam is battling floods, but the red carpet is laid out for the Governor", place: "Guwahati, Assam", date: "Aug 10, 2026" },
      { headline: "This incident in Hasanganj village: potholes and ditches in front of the school", place: "Gunnaur, Sambhal", date: "Aug 10, 2026" },
      { headline: "Rajnandgaon gets a gift of Rs 44 crore — Chhattisgarh's largest auditorium", place: "Rajnandgaon", date: "Aug 10, 2026" },
    ],
  },
  {
    title: "Kolkata",
    cards: [
      { headline: "Metro services extended on the Green Line ahead of the festive rush", place: "Esplanade, Kolkata", date: "Aug 9, 2026" },
      { headline: "Waterlogging in north Kolkata after an hour of heavy afternoon rain", place: "Ultadanga, Kolkata", date: "Aug 9, 2026" },
      { headline: "New Howrah bridge repainting drive begins, traffic rerouted at night", place: "Howrah", date: "Aug 8, 2026" },
      { headline: "Street food vendors near College Street get new hygiene ratings", place: "College Street, Kolkata", date: "Aug 8, 2026" },
      { headline: "Durga Puja pandal budgets swell as sponsors return in force this year", place: "Salt Lake, Kolkata", date: "Aug 7, 2026" },
    ],
  },
];

function PlayBadge({ size = 46 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        backgroundColor: BRAND,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(224,27,34,0.45)",
      }}
    >
      <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

function VideoCard({ card, tint }: { card: Card; tint: string; key?: React.Key }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", flexDirection: "column", gap: "8px", textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          borderRadius: "10px",
          background: tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          border: `1px solid ${LINE}`,
          transform: hover ? "translateY(-2px)" : "none",
          boxShadow: hover ? "0 10px 26px rgba(17,20,24,0.16)" : "0 1px 2px rgba(17,20,24,0.06)",
          transition: "transform 140ms ease, box-shadow 140ms ease",
        }}
      >
        <PlayBadge />
      </div>
      <h3
        style={{
          fontSize: "14px",
          lineHeight: 1.35,
          fontWeight: 600,
          color: INK,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {card.headline}
      </h3>
      <span style={{ fontSize: "12px", color: INK_SOFT }}>
        {card.place} · {card.date}
      </span>
    </a>
  );
}

export default function Portal() {
  const [activeRegion, setActiveRegion] = useState("Home");

  return (
    <div style={{ width: "100%", minHeight: "100%", backgroundColor: WASH, color: INK, fontFamily: "'Archivo','Anek Bangla','Anek Devanagari',sans-serif" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: PANEL,
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", height: "64px", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "20px" }}>G</div>
            <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.01em" }}>
              G<span style={{ color: BRAND }}>+</span> India News
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              style={{
                height: "38px",
                padding: "0 18px",
                borderRadius: "999px",
                border: "none",
                background: BRAND,
                color: "#fff",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Install App
            </button>
            <div style={{ width: "38px", height: "38px", borderRadius: "999px", border: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center", color: INK_SOFT }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Region nav */}
        <nav style={{ borderTop: `1px solid ${LINE}` }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 12px", display: "flex", gap: "4px", overflowX: "auto" }}>
            {REGIONS.map((r) => {
              const on = r === activeRegion;
              return (
                <button
                  key={r}
                  onClick={() => setActiveRegion(r)}
                  style={{
                    flex: "none",
                    background: "none",
                    border: "none",
                    padding: "14px 12px",
                    fontSize: "14px",
                    fontWeight: on ? 700 : 500,
                    color: on ? BRAND : INK,
                    borderBottom: on ? `3px solid ${BRAND}` : "3px solid transparent",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {r === "Home" ? "HOME" : r}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px 48px" }}>
        {/* Trending tags */}
        <div style={{ display: "flex", gap: "18px", overflowX: "auto", padding: "14px 0", borderBottom: `1px solid ${LINE}` }}>
          {TAGS.map((t) => (
            <a key={t} href="#" onClick={(e) => e.preventDefault()} style={{ flex: "none", fontSize: "14px", color: INK_SOFT, whiteSpace: "nowrap", textDecoration: "none" }}>
              {t}
            </a>
          ))}
        </div>

        {/* Category quick links */}
        <div style={{ display: "flex", gap: "18px", overflowX: "auto", padding: "20px 0" }}>
          {CATEGORIES.map((c) => (
            <a key={c.label} href="#" onClick={(e) => e.preventDefault()} style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "72px", textDecoration: "none", color: INK }}>
              <div style={{ width: "62px", height: "62px", borderRadius: "16px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>
                {c.emoji}
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{c.label}</span>
            </a>
          ))}
        </div>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <section key={section.title} style={{ marginTop: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800 }}>{section.title}</h2>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "14px", fontWeight: 700, color: BRAND, textDecoration: "none" }}>
                View More
              </a>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
                gap: "22px 18px",
              }}
            >
              {section.cards.map((card, ci) => (
                <VideoCard key={ci} card={card} tint={GRADIENTS[(si * 3 + ci) % GRADIENTS.length]} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer style={{ borderTop: `1px solid ${LINE}`, backgroundColor: PANEL }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 20px", display: "flex", flexWrap: "wrap", gap: "8px 20px", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: INK_SOFT }}>© 2026 G+ India News · Hyperlocal district video news</span>
          <div style={{ display: "flex", gap: "18px" }}>
            {["About", "Terms", "Privacy", "Contact"].map((l) => (
              <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "13px", color: INK_SOFT, textDecoration: "none" }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
