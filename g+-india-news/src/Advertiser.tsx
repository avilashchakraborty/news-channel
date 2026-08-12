import React, { useMemo, useState } from "react";

// ============================================================
// ADVERTISER PANEL — self-serve ad dashboard for G+ India News.
// Full local-state functionality: campaigns (create/pause/budget/
// targeting), ads (create/pause/creative), overview stats, billing.
// Wires onto the backend advertiser functions when deployed.
// ============================================================

const BRAND = "#E01B22";

const DISTRICTS = ["Durgapur", "Asansol", "Kolkata", "Bardhaman", "Bankura"];
const CATEGORIES = ["Civic", "Crime", "Politics", "Sport", "Weather", "Viral"];
const OBJECTIVES = ["Awareness", "Traffic", "Leads", "App installs"] as const;
const FORMATS = ["In-feed video", "Banner", "Sponsored card"] as const;

type Campaign = {
  id: string;
  name: string;
  objective: (typeof OBJECTIVES)[number];
  dailyBudget: number;
  districts: string[];
  categories: string[];
  start: string;
  end: string;
  status: "active" | "paused" | "ended";
  spend: number;
  impressions: number;
  clicks: number;
};

type Ad = {
  id: string;
  campaignId: string;
  headline: string;
  imageUrl: string;
  cta: string;
  url: string;
  format: (typeof FORMATS)[number];
  status: "active" | "paused";
  impressions: number;
  clicks: number;
};

let idSeq = 100;
const nextId = (p: string) => `${p}${idSeq++}`;

const SEED_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Durga Puja Sale — Durgapur", objective: "Traffic", dailyBudget: 1500, districts: ["Durgapur", "Asansol"], categories: ["Civic", "Viral"], start: "2026-08-01", end: "2026-08-31", status: "active", spend: 18400, impressions: 214000, clicks: 5320 },
  { id: "c2", name: "Coaching admissions drive", objective: "Leads", dailyBudget: 800, districts: ["Kolkata"], categories: ["Politics", "Sport"], start: "2026-08-05", end: "2026-09-05", status: "paused", spend: 6200, impressions: 71000, clicks: 1180 },
];

const SEED_ADS: Ad[] = [
  { id: "a1", campaignId: "c1", headline: "Biggest Puja offers at City Centre — up to 60% off", imageUrl: "", cta: "Shop now", url: "https://example.com/puja", format: "In-feed video", status: "active", impressions: 128000, clicks: 3410 },
  { id: "a2", campaignId: "c1", headline: "Free home delivery across Durgapur this week", imageUrl: "", cta: "Order now", url: "https://example.com/delivery", format: "Sponsored card", status: "active", impressions: 86000, clicks: 1910 },
  { id: "a3", campaignId: "c2", headline: "Enroll for JEE/NEET 2027 batch — early bird seats", imageUrl: "", cta: "Apply", url: "https://example.com/coaching", format: "Banner", status: "paused", impressions: 71000, clicks: 1180 },
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const compact = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : String(n));
const ctr = (clicks: number, imp: number) => (imp ? ((clicks / imp) * 100).toFixed(2) + "%" : "—");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  height: "40px",
  background: "var(--panel-2)",
  border: "1px solid var(--line)",
  borderRadius: "8px",
  padding: "0 12px",
  color: "var(--chrome)",
  fontSize: "14px",
  fontFamily: "Archivo, sans-serif",
};

function Chips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            style={{
              padding: "5px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              cursor: "pointer",
              border: `1px solid ${on ? BRAND : "var(--line)"}`,
              background: on ? BRAND : "transparent",
              color: on ? "#fff" : "var(--chrome-soft)",
            }}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "520px", maxHeight: "88vh", overflowY: "auto", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--chrome)" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--chrome-soft)", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "16px" }}>
      <div style={{ fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--chrome)", marginTop: "4px" }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--pass)", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = { active: "var(--pass)", paused: "var(--warn)", ended: "var(--chrome-soft)" };
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: map[status] ?? "var(--chrome)", border: `1px solid ${map[status] ?? "var(--line)"}`, padding: "2px 8px", borderRadius: "999px" }}>
      {status}
    </span>
  );
}

export default function Advertiser() {
  const [section, setSection] = useState<"Overview" | "Campaigns" | "Ads" | "Billing">("Overview");
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [ads, setAds] = useState<Ad[]>(SEED_ADS);
  const [wallet, setWallet] = useState(42000);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const totals = useMemo(() => {
    const spend = campaigns.reduce((s, c) => s + c.spend, 0);
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const active = campaigns.filter((c) => c.status === "active").length;
    return { spend, impressions, clicks, active };
  }, [campaigns]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const toggleCampaign = (id: string) =>
    setCampaigns((cs) => cs.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)));
  const toggleAd = (id: string) =>
    setAds((as) => as.map((a) => (a.id === id ? { ...a, status: a.status === "active" ? "paused" : "active" } : a)));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "var(--void)" }}>
      {/* Top bar */}
      <div style={{ height: "56px", flex: "none", background: "var(--panel)", borderBottom: "1px solid var(--line)", padding: "0 20px 0 96px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--chrome)" }}>Advertiser Studio</span>
          <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>G+ India News Ads</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>Wallet: <b style={{ color: "var(--chrome)" }}>{inr(wallet)}</b></span>
          <span style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>@durgapur_traders</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left nav */}
        <div style={{ width: "200px", flex: "none", background: "var(--panel)", borderRight: "1px solid var(--line)", padding: "12px 0", display: "flex", flexDirection: "column" }}>
          {(["Overview", "Campaigns", "Ads", "Billing"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              style={{
                textAlign: "left",
                padding: "12px 20px",
                background: section === s ? "var(--panel-2)" : "transparent",
                border: "none",
                borderLeft: section === s ? `2px solid ${BRAND}` : "2px solid transparent",
                color: section === s ? "var(--chrome)" : "var(--chrome-soft)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {section === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--chrome)" }}>Overview</h1>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
                <StatTile label="Active campaigns" value={String(totals.active)} />
                <StatTile label="Spend (this month)" value={inr(totals.spend)} sub="+12% vs last" />
                <StatTile label="Impressions" value={compact(totals.impressions)} sub="+21%" />
                <StatTile label="Clicks" value={compact(totals.clicks)} />
                <StatTile label="Avg CTR" value={ctr(totals.clicks, totals.impressions)} />
              </div>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--chrome)", marginBottom: "10px" }}>Top campaigns</h3>
                {campaigns.map((c) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "13px", color: "var(--chrome)" }}>{c.name}</span>
                    <span style={{ fontSize: "12px", color: "var(--chrome-soft)" }}>{compact(c.impressions)} impressions · {ctr(c.clicks, c.impressions)} CTR</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "Campaigns" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--chrome)" }}>Campaigns</h1>
                <button onClick={() => setShowCampaign(true)} style={{ height: "40px", padding: "0 16px", borderRadius: "8px", border: "none", background: BRAND, color: "#fff", fontWeight: 700, cursor: "pointer" }}>+ New campaign</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {campaigns.map((c) => (
                  <div key={c.id} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--chrome)" }}>{c.name}</span>
                          <StatusPill status={c.status} />
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--chrome-soft)", marginTop: "4px" }}>
                          {c.objective} · {inr(c.dailyBudget)}/day · {c.districts.join(", ")} · {c.categories.join(", ")}
                        </div>
                      </div>
                      <button onClick={() => toggleCampaign(c.id)} style={{ height: "34px", padding: "0 14px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", color: "var(--chrome)", fontSize: "13px", cursor: "pointer" }}>
                        {c.status === "active" ? "Pause" : "Resume"}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "24px", marginTop: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: "var(--chrome-soft)" }}>Spend <b style={{ color: "var(--chrome)" }}>{inr(c.spend)}</b></span>
                      <span style={{ fontSize: "12px", color: "var(--chrome-soft)" }}>Impressions <b style={{ color: "var(--chrome)" }}>{compact(c.impressions)}</b></span>
                      <span style={{ fontSize: "12px", color: "var(--chrome-soft)" }}>Clicks <b style={{ color: "var(--chrome)" }}>{compact(c.clicks)}</b></span>
                      <span style={{ fontSize: "12px", color: "var(--chrome-soft)" }}>CTR <b style={{ color: "var(--chrome)" }}>{ctr(c.clicks, c.impressions)}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === "Ads" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--chrome)" }}>Ads</h1>
                <button onClick={() => setShowAd(true)} style={{ height: "40px", padding: "0 16px", borderRadius: "8px", border: "none", background: BRAND, color: "#fff", fontWeight: 700, cursor: "pointer" }}>+ New ad</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                {ads.map((a) => {
                  const camp = campaigns.find((c) => c.id === a.campaignId);
                  return (
                    <div key={a.id} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ position: "relative", aspectRatio: "16/9", background: a.imageUrl ? `center/cover url(${a.imageUrl})` : "linear-gradient(135deg,#1B2A3D,#33506F)", display: "flex", alignItems: "flex-end", padding: "10px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "2px 8px", borderRadius: "999px" }}>{a.format}</span>
                        <span style={{ position: "absolute", top: "10px", right: "10px" }}><StatusPill status={a.status} /></span>
                      </div>
                      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--chrome)", lineHeight: 1.35 }}>{a.headline}</div>
                        <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>{camp?.name ?? "—"} · CTA: {a.cta}</div>
                        <div style={{ display: "flex", gap: "14px" }}>
                          <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>{compact(a.impressions)} imp</span>
                          <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>{compact(a.clicks)} clicks</span>
                          <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>{ctr(a.clicks, a.impressions)} CTR</span>
                        </div>
                        <button onClick={() => toggleAd(a.id)} style={{ height: "32px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", color: "var(--chrome)", fontSize: "12px", cursor: "pointer" }}>
                          {a.status === "active" ? "Pause ad" : "Resume ad"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {section === "Billing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "560px" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--chrome)" }}>Billing</h1>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "20px" }}>
                <div style={{ fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase" }}>Wallet balance</div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--chrome)", margin: "4px 0 12px" }}>{inr(wallet)}</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1000, 5000, 10000].map((amt) => (
                    <button key={amt} onClick={() => { setWallet((w) => w + amt); flash(`Added ${inr(amt)} to wallet`); }} style={{ height: "38px", padding: "0 14px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", color: "var(--chrome)", cursor: "pointer" }}>
                      + {inr(amt)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--chrome)", marginBottom: "10px" }}>Recent spend</h3>
                {campaigns.map((c) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "13px", color: "var(--chrome)" }}>{c.name}</span>
                    <span style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>{inr(c.spend)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCampaign && (
        <NewCampaign
          onClose={() => setShowCampaign(false)}
          onCreate={(c) => {
            setCampaigns((cs) => [{ ...c, id: nextId("c"), status: "active", spend: 0, impressions: 0, clicks: 0 }, ...cs]);
            setShowCampaign(false);
            setSection("Campaigns");
            flash("Campaign created");
          }}
        />
      )}
      {showAd && (
        <NewAd
          campaigns={campaigns}
          onClose={() => setShowAd(false)}
          onCreate={(a) => {
            setAds((as) => [{ ...a, id: nextId("a"), status: "active", impressions: 0, clicks: 0 }, ...as]);
            setShowAd(false);
            setSection("Ads");
            flash("Ad submitted for review");
          }}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "var(--panel-2)", border: "1px solid var(--line)", borderLeft: `4px solid ${BRAND}`, borderRadius: "8px", padding: "10px 16px", color: "var(--chrome)", fontSize: "13px", zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function NewCampaign({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Omit<Campaign, "id" | "status" | "spend" | "impressions" | "clicks">) => void }) {
  const [name, setName] = useState("");
  const [objective, setObjective] = useState<(typeof OBJECTIVES)[number]>("Traffic");
  const [dailyBudget, setDailyBudget] = useState(500);
  const [districts, setDistricts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [start, setStart] = useState("2026-08-12");
  const [end, setEnd] = useState("2026-09-12");

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const valid = name.trim().length >= 3 && dailyBudget >= 100 && districts.length > 0;

  return (
    <Modal title="New campaign" onClose={onClose}>
      <Field label="Campaign name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali offers — Durgapur" /></Field>
      <Field label="Objective">
        <select style={inputStyle} value={objective} onChange={(e) => setObjective(e.target.value as (typeof OBJECTIVES)[number])}>
          {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Daily budget (₹)"><input type="number" min={100} style={inputStyle} value={dailyBudget} onChange={(e) => setDailyBudget(Number(e.target.value))} /></Field>
      <Field label="Target districts"><Chips options={DISTRICTS} selected={districts} onToggle={(v) => toggle(districts, setDistricts, v)} /></Field>
      <Field label="Target categories"><Chips options={CATEGORIES} selected={categories} onToggle={(v) => toggle(categories, setCategories, v)} /></Field>
      <div style={{ display: "flex", gap: "10px" }}>
        <Field label="Start"><input type="date" style={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        <Field label="End"><input type="date" style={inputStyle} value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
      </div>
      <button disabled={!valid} onClick={() => onCreate({ name, objective, dailyBudget, districts, categories, start, end })} style={{ height: "44px", borderRadius: "8px", border: "none", background: valid ? BRAND : "var(--line)", color: "#fff", fontWeight: 700, cursor: valid ? "pointer" : "not-allowed", marginTop: "4px" }}>
        Launch campaign
      </button>
    </Modal>
  );
}

function NewAd({ campaigns, onClose, onCreate }: { campaigns: Campaign[]; onClose: () => void; onCreate: (a: Omit<Ad, "id" | "status" | "impressions" | "clicks">) => void }) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [headline, setHeadline] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cta, setCta] = useState("Learn more");
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("In-feed video");
  const valid = headline.trim().length >= 5 && /^https?:\/\//.test(url) && campaignId;

  return (
    <Modal title="New ad" onClose={onClose}>
      <Field label="Campaign">
        <select style={inputStyle} value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Headline"><input style={inputStyle} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Your offer in one line" /></Field>
      <Field label="Image URL (optional)"><input style={inputStyle} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></Field>
      <div style={{ display: "flex", gap: "10px" }}>
        <Field label="Call to action"><input style={inputStyle} value={cta} onChange={(e) => setCta(e.target.value)} /></Field>
        <Field label="Format">
          <select style={inputStyle} value={format} onChange={(e) => setFormat(e.target.value as (typeof FORMATS)[number])}>
            {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Destination URL"><input style={inputStyle} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-site.com" /></Field>
      <button disabled={!valid} onClick={() => onCreate({ campaignId, headline, imageUrl, cta, url, format })} style={{ height: "44px", borderRadius: "8px", border: "none", background: valid ? BRAND : "var(--line)", color: "#fff", fontWeight: 700, cursor: valid ? "pointer" : "not-allowed", marginTop: "4px" }}>
        Submit ad
      </button>
    </Modal>
  );
}
