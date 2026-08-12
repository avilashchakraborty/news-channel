import React, { useEffect, useMemo, useRef, useState } from "react";
import { AdPlacements, DEFAULT_AD_PLACEMENTS, SAMPLE_SPONSORED, SponsoredAd } from "./adConfig";

// ============================================================
// WEB PORTAL — public.app-style desktop news portal (light).
// The public SEO/web surface: region nav, trending tags, quick
// links, and district/category grids of video cards. Content is
// sample data with photo thumbnails; it maps 1:1 onto getFeed()
// when the backend is wired (each card => a published Video).
// ============================================================

const BRAND = "#E01B22";
const INK = "#111418";
const INK_SOFT = "#6B7280";
const LINE = "#E7E9EC";
const PANEL = "#FFFFFF";
const WASH = "#F6F7F9";

type Article = {
  id: string;
  headline: string;
  place: string;
  date: string;
  region: string; // district or "National"
  state: string; // "West Bengal" | "India"
  category: string; // Breaking | Police | Civic | Politics | Viral | Accident | Sports
  seed: string; // deterministic photo seed
};

const ARTICLES: Article[] = [
  { id: "d1", headline: "Road caves in near Durgapur Steel Plant, two-hour diversion in place", place: "Durgapur, Paschim Bardhaman", date: "Aug 10, 2026", region: "Durgapur", state: "West Bengal", category: "Civic", seed: "durgapur-road" },
  { id: "d2", headline: "Traders protest at Benachity market against a new municipal levy", place: "Durgapur, Paschim Bardhaman", date: "Aug 10, 2026", region: "Durgapur", state: "West Bengal", category: "Politics", seed: "benachity" },
  { id: "d3", headline: "সিটি সেন্টারে নতুন সরকারি হাসপাতাল ভবন চালু হচ্ছে আগামী মাসে", place: "City Centre, Durgapur", date: "Aug 9, 2026", region: "Durgapur", state: "West Bengal", category: "Civic", seed: "hospital" },
  { id: "d4", headline: "Power cuts leave Muchipara residents stranded through the night", place: "Muchipara, Durgapur", date: "Aug 9, 2026", region: "Durgapur", state: "West Bengal", category: "Civic", seed: "powercut" },
  { id: "d5", headline: "Water level rises at Durgapur Barrage after upstream rain", place: "Durgapur Barrage", date: "Aug 8, 2026", region: "Durgapur", state: "West Bengal", category: "Breaking", seed: "barrage" },
  { id: "d6", headline: "Bike rider hurt as truck jumps signal on the NH-19 bypass", place: "Rajbandh, Durgapur", date: "Aug 8, 2026", region: "Durgapur", state: "West Bengal", category: "Accident", seed: "nh19" },

  { id: "a1", headline: "Coal-belt cooperative announces record payout to member families", place: "Asansol, Paschim Bardhaman", date: "Aug 9, 2026", region: "Asansol", state: "West Bengal", category: "Politics", seed: "asansol-coal" },
  { id: "a2", headline: "Night patrols stepped up after a spate of two-wheeler thefts", place: "Asansol, Paschim Bardhaman", date: "Aug 8, 2026", region: "Asansol", state: "West Bengal", category: "Police", seed: "asansol-patrol" },
  { id: "a3", headline: "Local club's football final draws a packed ground in Asansol", place: "Asansol, Paschim Bardhaman", date: "Aug 7, 2026", region: "Asansol", state: "West Bengal", category: "Sports", seed: "asansol-football" },

  { id: "k1", headline: "Metro services extended on the Green Line ahead of the festive rush", place: "Esplanade, Kolkata", date: "Aug 9, 2026", region: "Kolkata", state: "West Bengal", category: "Civic", seed: "kolkata-metro" },
  { id: "k2", headline: "Waterlogging in north Kolkata after an hour of heavy afternoon rain", place: "Ultadanga, Kolkata", date: "Aug 9, 2026", region: "Kolkata", state: "West Bengal", category: "Civic", seed: "kolkata-rain" },
  { id: "k3", headline: "Durga Puja pandal budgets swell as sponsors return in force this year", place: "Salt Lake, Kolkata", date: "Aug 7, 2026", region: "Kolkata", state: "West Bengal", category: "Viral", seed: "puja" },
  { id: "k4", headline: "New hygiene ratings for street-food stalls near College Street", place: "College Street, Kolkata", date: "Aug 8, 2026", region: "Kolkata", state: "West Bengal", category: "Civic", seed: "collegestreet" },

  { id: "n1", headline: "On World Tribal Day, a big message to the youth with an assurance of jobs", place: "Ranchi, Jharkhand", date: "Aug 9, 2026", region: "National", state: "India", category: "Politics", seed: "tribal-day" },
  { id: "n2", headline: "Clash between two groups during the Chehalum fair, sticks and stones fly", place: "Kichha, Udham Singh Nagar", date: "Aug 10, 2026", region: "National", state: "India", category: "Breaking", seed: "chehalum" },
  { id: "n3", headline: "Students protesting a recruitment exam were lathi-charged and tear-gassed", place: "Kanke, Ranchi", date: "Aug 10, 2026", region: "National", state: "India", category: "Breaking", seed: "protest" },
  { id: "n4", headline: "A father staying hungry to feed his family: a story that went viral overnight", place: "Sadar, Lucknow", date: "Aug 10, 2026", region: "National", state: "India", category: "Viral", seed: "father" },
  { id: "n5", headline: "Flood-hit villages wait as relief boats reach the last stranded families", place: "Guwahati, Assam", date: "Aug 10, 2026", region: "National", state: "India", category: "Breaking", seed: "flood" },
];

const REGIONS = [
  "Home",
  "Durgapur",
  "Asansol",
  "Kolkata",
  "Bardhaman",
  "Bankura",
  "West Bengal",
  "Bihar",
  "Jharkhand",
  "Delhi",
  "National",
];

const CHIPS = ["All", "Breaking", "Police", "Civic", "Politics", "Viral", "Accident", "Sports"];

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

const GRADIENTS = [
  "linear-gradient(135deg,#1B2A3D,#33506F)",
  "linear-gradient(135deg,#2E2340,#5B4A7A)",
  "linear-gradient(135deg,#10332C,#1F6B57)",
  "linear-gradient(135deg,#3D1F1F,#7A3B3B)",
  "linear-gradient(135deg,#3A2E12,#6E571F)",
  "linear-gradient(135deg,#122A3A,#255873)",
];

function thumbUrl(seed: string, w = 480, h = 360): string {
  return `https://picsum.photos/seed/gplus-${seed}/${w}/${h}`;
}

function compact(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : String(n);
}

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
        boxShadow: "0 4px 14px rgba(224,27,34,0.5)",
      }}
    >
      <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}

function Thumb({ seed, tint, radius = 10 }: { seed: string; tint: string; radius?: number; key?: React.Key }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: radius,
        background: tint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: `1px solid ${LINE}`,
      }}
    >
      {!failed && (
        <img
          src={thumbUrl(seed)}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35))" }} />
      <PlayBadge />
    </div>
  );
}

function VideoCard({ article, tint, onOpen }: { article: Article; tint: string; onOpen: (a: Article) => void; key?: React.Key }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={() => onOpen(article)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        textAlign: "left",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: "inherit",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "transform 140ms ease",
      }}
    >
      <div style={{ boxShadow: hover ? "0 10px 26px rgba(17,20,24,0.18)" : "0 1px 2px rgba(17,20,24,0.06)", borderRadius: "10px", transition: "box-shadow 140ms ease" }}>
        <Thumb seed={article.seed} tint={tint} />
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
        {article.headline}
      </h3>
      <span style={{ fontSize: "12px", color: INK_SOFT }}>
        {article.place} · {article.date}
      </span>
    </button>
  );
}

function SponsoredCard({ ad, tint }: { ad: SponsoredAd; tint: string; key?: React.Key }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer"
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
          overflow: "hidden",
          border: `1px solid ${LINE}`,
          transform: hover ? "translateY(-2px)" : "none",
          boxShadow: hover ? "0 10px 26px rgba(17,20,24,0.16)" : "0 1px 2px rgba(17,20,24,0.06)",
          transition: "transform 140ms ease, box-shadow 140ms ease",
        }}
      >
        <img src={`https://picsum.photos/seed/gplus-${ad.seed}/480/360`} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <span style={{ position: "absolute", top: "8px", left: "8px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", color: "#111", background: "rgba(255,255,255,0.92)", padding: "2px 7px", borderRadius: "4px" }}>SPONSORED</span>
      </div>
      <h3 style={{ fontSize: "14px", lineHeight: 1.35, fontWeight: 600, color: INK, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ad.headline}</h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: INK_SOFT }}>{ad.advertiser}</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", background: BRAND, padding: "3px 10px", borderRadius: "999px", whiteSpace: "nowrap" }}>{ad.cta}</span>
      </div>
    </a>
  );
}

function Grid({ items, onOpen, sponsoredEvery, ad }: { items: Article[]; onOpen: (a: Article) => void; sponsoredEvery?: number; ad?: SponsoredAd }) {
  const cells: React.ReactNode[] = [];
  items.forEach((a, i) => {
    cells.push(<VideoCard key={a.id} article={a} tint={GRADIENTS[i % GRADIENTS.length]} onOpen={onOpen} />);
    if (ad && sponsoredEvery && sponsoredEvery > 0 && (i + 1) % sponsoredEvery === 0) {
      cells.push(<SponsoredCard key={`ad-${i}`} ad={ad} tint={GRADIENTS[(i + 3) % GRADIENTS.length]} />);
    }
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "22px 18px" }}>
      {cells}
    </div>
  );
}

function SectionHeader({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 800 }}>{title}</h2>
      {onMore && (
        <button onClick={onMore} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: 700, color: BRAND, cursor: "pointer" }}>
          View More
        </button>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center", background: PANEL, border: `1px dashed ${LINE}`, borderRadius: "12px" }}>
      <div style={{ fontSize: "34px", marginBottom: "8px" }}>📍</div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: INK }}>No videos yet in {label}</h3>
      <p style={{ fontSize: "13px", color: INK_SOFT, marginTop: "4px" }}>Be the first to report from here — sign in and post a video.</p>
    </div>
  );
}

function UtilityPanel({ label, emoji, onBack }: { label: string; emoji: string; onBack: () => void }) {
  return (
    <div style={{ padding: "44px 24px", textAlign: "center", background: PANEL, border: `1px solid ${LINE}`, borderRadius: "12px" }}>
      <div style={{ fontSize: "44px", marginBottom: "10px" }}>{emoji}</div>
      <h3 style={{ fontSize: "20px", fontWeight: 800, color: INK }}>{label}</h3>
      <p style={{ fontSize: "14px", color: INK_SOFT, marginTop: "6px", maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
        {label} for your district is coming soon. We're wiring live data feeds for this section.
      </p>
      <button onClick={onBack} style={{ marginTop: "18px", height: "40px", padding: "0 20px", borderRadius: "999px", border: "none", background: BRAND, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
        Back to news
      </button>
    </div>
  );
}

function DetailModal({ article, onClose, sponsored, onOpenFeed }: { article: Article; onClose: () => void; sponsored?: SponsoredAd | null; onOpenFeed?: () => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", background: PANEL, borderRadius: "16px", overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}
      >
        <button
          onClick={() => onOpenFeed?.()}
          style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: GRADIENTS[0], display: "flex", alignItems: "center", justifyContent: "center", border: "none", padding: 0, cursor: "pointer" }}
          aria-label="Play in feed"
        >
          {!failed && (
            <img
              src={thumbUrl(article.seed, 960, 540)}
              alt=""
              onError={() => setFailed(true)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
          <PlayBadge size={66} />
        </button>
        <div style={{ position: "relative" }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: "absolute", top: "-52px", right: "12px", width: "34px", height: "34px", borderRadius: "999px", border: "none", background: "rgba(0,0,0,0.5)", color: "#fff", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "18px 20px 22px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: BRAND, padding: "3px 10px", borderRadius: "999px" }}>{article.category}</span>
            <span style={{ fontSize: "11px", fontWeight: 700, color: INK, background: WASH, padding: "3px 10px", borderRadius: "999px", border: `1px solid ${LINE}` }}>{article.region}</span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: INK, lineHeight: 1.3 }}>{article.headline}</h2>
          <p style={{ fontSize: "13px", color: INK_SOFT, marginTop: "8px" }}>{article.place} · {article.date}</p>
          <p style={{ fontSize: "13px", color: INK_SOFT, marginTop: "14px", lineHeight: 1.5 }}>
            Video playback connects to the reporter feed once the Bunny Stream backend is live. This preview shows how a published
            report appears to readers on the web.
          </p>

          {sponsored && (
            <a
              href={sponsored.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "18px", padding: "12px", borderRadius: "12px", border: `1px solid ${LINE}`, background: WASH, textDecoration: "none" }}
            >
              <div style={{ position: "relative", width: "96px", flexShrink: 0, aspectRatio: "1 / 1", borderRadius: "8px", overflow: "hidden", background: GRADIENTS[2] }}>
                <img src={thumbUrl(sponsored.seed, 240, 240)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", color: INK_SOFT }}>SPONSORED · YOU MIGHT LIKE</span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: INK, lineHeight: 1.3, margin: "4px 0" }}>{sponsored.headline}</div>
                <span style={{ fontSize: "12px", color: INK_SOFT }}>{sponsored.advertiser}</span>
              </div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff", background: BRAND, padding: "8px 14px", borderRadius: "999px", whiteSpace: "nowrap" }}>{sponsored.cta}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Full-screen vertical "Reels" feed. Videos scroll-snap one per screen; when the
// admin enables in-feed ads, a full-screen Sponsored slide is injected every
// N videos (adPlacements.frequency).
type FeedSlide = { kind: "video"; article: Article } | { kind: "ad"; ad: SponsoredAd };

function FeedRail({ likes, comments }: { likes: number; comments: number }) {
  const btn: React.CSSProperties = { width: "44px", height: "44px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ position: "absolute", right: "12px", bottom: "96px", display: "flex", flexDirection: "column", gap: "18px", alignItems: "center" }}>
      {[
        { icon: "♥", label: compact(likes) },
        { icon: "💬", label: compact(comments) },
        { icon: "↪", label: "Share" },
      ].map((b) => (
        <div key={b.icon} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <button style={btn}>{b.icon}</button>
          <span style={{ fontSize: "11px", color: "#fff", fontWeight: 600 }}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

function VerticalFeed({ items, startIndex, adPlacements, onClose }: { items: Article[]; startIndex: number; adPlacements: AdPlacements; onClose: () => void }) {
  const scroller = useRef<HTMLDivElement>(null);

  const slides = useMemo<FeedSlide[]>(() => {
    const out: FeedSlide[] = [];
    items.forEach((article, i) => {
      out.push({ kind: "video", article });
      if (adPlacements.inFeed && adPlacements.frequency > 0 && (i + 1) % adPlacements.frequency === 0) {
        out.push({ kind: "ad", ad: SAMPLE_SPONSORED });
      }
    });
    return out;
  }, [items, adPlacements]);

  // Slide index of the starting video (ads before it shift the position).
  const startSlide = useMemo(() => {
    let v = -1;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].kind === "video") v++;
      if (v === startIndex) return i;
    }
    return 0;
  }, [slides, startIndex]);

  useEffect(() => {
    const el = scroller.current?.children[startSlide] as HTMLElement | undefined;
    el?.scrollIntoView();
  }, [startSlide]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 80, display: "flex", justifyContent: "center" }}>
      <button
        onClick={onClose}
        aria-label="Close feed"
        style={{ position: "absolute", top: "16px", left: "16px", zIndex: 3, width: "40px", height: "40px", borderRadius: "999px", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "18px", cursor: "pointer" }}
      >
        ✕
      </button>

      <div
        ref={scroller}
        style={{ width: "100%", maxWidth: "480px", height: "100%", overflowY: "auto", scrollSnapType: "y mandatory", background: "#000" }}
      >
        {slides.map((slide, i) => {
          if (slide.kind === "ad") {
            const ad = slide.ad;
            return (
              <div key={`ad-${i}`} style={{ height: "100%", scrollSnapAlign: "start", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <img src={thumbUrl(ad.seed, 720, 1280)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.85) 100%)" }} />
                <span style={{ position: "absolute", top: "16px", right: "16px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em", color: "#111", background: "rgba(255,255,255,0.92)", padding: "3px 10px", borderRadius: "6px" }}>SPONSORED</span>
                <div style={{ position: "relative", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{ad.advertiser}</span>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>{ad.headline}</h2>
                  <a href={ad.url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start", marginTop: "6px", background: BRAND, color: "#fff", fontWeight: 700, fontSize: "15px", padding: "12px 24px", borderRadius: "999px", textDecoration: "none" }}>
                    {ad.cta} →
                  </a>
                </div>
              </div>
            );
          }
          const a = slide.article;
          const likes = 800 + ((i * 137) % 9000);
          const comments = 20 + ((i * 41) % 400);
          return (
            <div key={a.id} style={{ height: "100%", scrollSnapAlign: "start", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <img src={thumbUrl(a.seed, 720, 1280)} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.8) 100%)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                <PlayBadge size={64} />
              </div>
              <FeedRail likes={likes} comments={comments} />
              <div style={{ position: "relative", padding: "20px 76px 24px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>{a.region[0] ?? "G"}</div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>@{a.region.toLowerCase()}_reporter</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: BRAND, padding: "2px 8px", borderRadius: "999px" }}>{a.category}</span>
                </div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>{a.headline}</h2>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>{a.place} · {a.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Portal({
  onNavigate,
  adPlacements = DEFAULT_AD_PLACEMENTS,
}: {
  onNavigate?: (screen: "A" | "B" | "C" | "D" | "E") => void;
  adPlacements?: AdPlacements;
}) {
  const homeAds = adPlacements.homeSponsored ? { sponsoredEvery: adPlacements.frequency, ad: SAMPLE_SPONSORED } : {};
  const pageAds = adPlacements.districtPages ? { sponsoredEvery: adPlacements.frequency, ad: SAMPLE_SPONSORED } : {};
  const [region, setRegion] = useState("Home");
  const [chip, setChip] = useState("All");
  const [utility, setUtility] = useState<{ label: string; emoji: string } | null>(null);
  const [selected, setSelected] = useState<Article | null>(null);
  const [feedStart, setFeedStart] = useState<number | null>(null);

  const openFeedAt = (article: Article) => {
    const idx = ARTICLES.findIndex((x) => x.id === article.id);
    setSelected(null);
    setFeedStart(idx >= 0 ? idx : 0);
  };

  const districtRegions = new Set(["Durgapur", "Asansol", "Kolkata", "Bardhaman", "Bankura", "National"]);

  const filtered = useMemo(() => {
    let list = ARTICLES;
    if (region !== "Home") {
      list = list.filter((a) => (districtRegions.has(region) ? a.region === region : a.state === region));
    }
    if (chip !== "All") list = list.filter((a) => a.category === chip);
    return list;
  }, [region, chip]);

  const goSignIn = () => onNavigate?.("A");

  return (
    <div style={{ width: "100%", minHeight: "100%", backgroundColor: WASH, color: INK, fontFamily: "'Archivo','Anek Bangla','Anek Devanagari',sans-serif" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, backgroundColor: PANEL, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", height: "64px", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <button
            onClick={() => { setRegion("Home"); setChip("All"); setUtility(null); }}
            style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer" }}
          >
            <div style={{ width: "34px", height: "34px", borderRadius: "999px", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "20px" }}>G</div>
            <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.01em", color: INK }}>
              G<span style={{ color: BRAND }}>+</span> India News
            </span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setFeedStart(0)} style={{ height: "38px", padding: "0 16px", borderRadius: "999px", border: `1px solid ${LINE}`, background: PANEL, color: INK, fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: BRAND }}>▶</span> Reels
            </button>
            <button onClick={goSignIn} style={{ height: "38px", padding: "0 18px", borderRadius: "999px", border: "none", background: BRAND, color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
              Install App
            </button>
            <button onClick={goSignIn} aria-label="Sign in" style={{ width: "38px", height: "38px", borderRadius: "999px", border: `1px solid ${LINE}`, background: PANEL, display: "flex", alignItems: "center", justifyContent: "center", color: INK_SOFT, cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Region nav */}
        <nav style={{ borderTop: `1px solid ${LINE}` }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 12px", display: "flex", gap: "4px", overflowX: "auto" }}>
            {REGIONS.map((r) => {
              const on = r === region && !utility;
              return (
                <button
                  key={r}
                  onClick={() => { setRegion(r); setUtility(null); }}
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
        {/* Trending tags → category filter */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", padding: "14px 0", borderBottom: `1px solid ${LINE}` }}>
          {CHIPS.map((t) => {
            const on = t === chip;
            return (
              <button
                key={t}
                onClick={() => { setChip(t); setUtility(null); }}
                style={{
                  flex: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: on ? "#fff" : INK,
                  background: on ? BRAND : WASH,
                  border: `1px solid ${on ? BRAND : LINE}`,
                  borderRadius: "999px",
                  padding: "7px 14px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Category quick links */}
        <div style={{ display: "flex", gap: "18px", overflowX: "auto", padding: "20px 0" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => setUtility({ label: c.label, emoji: c.emoji })}
              style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "72px", background: "none", border: "none", cursor: "pointer", color: INK }}
            >
              <div style={{ width: "62px", height: "62px", borderRadius: "16px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>{c.emoji}</div>
              <span style={{ fontSize: "12px", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        {utility ? (
          <UtilityPanel label={utility.label} emoji={utility.emoji} onBack={() => setUtility(null)} />
        ) : region === "Home" && chip === "All" ? (
          // Curated home: sections like public.app
          <>
            <section style={{ marginTop: "12px" }}>
              <SectionHeader title="Top stories" />
              <Grid items={ARTICLES.filter((a) => a.category === "Breaking" || a.region === "National").slice(0, 5)} onOpen={setSelected} {...homeAds} />
            </section>
            {["Durgapur", "Viral", "Kolkata"].map((title) => {
              const items =
                title === "Viral"
                  ? ARTICLES.filter((a) => a.category === "Viral")
                  : ARTICLES.filter((a) => a.region === title);
              if (items.length === 0) return null;
              return (
                <section key={title} style={{ marginTop: "28px" }}>
                  <SectionHeader title={title} onMore={() => (title === "Viral" ? setChip("Viral") : setRegion(title))} />
                  <Grid items={items} onOpen={setSelected} {...homeAds} />
                </section>
              );
            })}
          </>
        ) : (
          <section style={{ marginTop: "16px" }}>
            <SectionHeader title={chip !== "All" ? `${chip}${region !== "Home" ? " · " + region : ""}` : region} />
            {filtered.length > 0 ? <Grid items={filtered} onOpen={setSelected} {...pageAds} /> : <EmptyState label={region === "Home" ? chip : region} />}
          </section>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${LINE}`, backgroundColor: PANEL }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 20px", display: "flex", flexWrap: "wrap", gap: "8px 20px", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", color: INK_SOFT }}>© 2026 G+ India News · Hyperlocal district video news</span>
          <div style={{ display: "flex", gap: "18px" }}>
            <button onClick={() => onNavigate?.("E")} style={{ background: "none", border: "none", fontSize: "13px", color: BRAND, fontWeight: 700, cursor: "pointer" }}>Advertise with us</button>
            <button onClick={goSignIn} style={{ background: "none", border: "none", fontSize: "13px", color: INK_SOFT, cursor: "pointer" }}>Reporter login</button>
            {["About", "Terms", "Privacy"].map((l) => (
              <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "13px", color: INK_SOFT, textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {selected && (
        <DetailModal
          article={selected}
          onClose={() => setSelected(null)}
          sponsored={adPlacements.videoDetail ? SAMPLE_SPONSORED : null}
          onOpenFeed={() => openFeedAt(selected)}
        />
      )}

      {feedStart !== null && (
        <VerticalFeed items={ARTICLES} startIndex={feedStart} adPlacements={adPlacements} onClose={() => setFeedStart(null)} />
      )}
    </div>
  );
}
