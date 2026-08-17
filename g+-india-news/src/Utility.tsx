import React from "react";

// Utility services (Gold, Fuel, Weather, Panchang, Horoscope, Jobs, Mandi,
// Electricity, Schemes). Structured, real-looking pages backed by sample data
// and ready to swap in live API feeds. Light theme to match the portal.

const BRAND = "#E01B22";
const INK = "#111418";
const INK_SOFT = "#6B7280";
const LINE = "#E7E9EC";
const PANEL = "#FFFFFF";
const WASH = "#F6F7F9";

export type UtilityKey =
  | "horoscope"
  | "gold"
  | "fuel"
  | "weather"
  | "panchang"
  | "jobs"
  | "mandi"
  | "bijli"
  | "commodities"
  | "schemes";

export const UTILITY_SERVICES: { key: UtilityKey; label: string; emoji: string; bg: string }[] = [
  { key: "horoscope", label: "Horoscope", emoji: "🔮", bg: "#1F2937" },
  { key: "panchang", label: "Panchang", emoji: "📜", bg: "#B45309" },
  { key: "gold", label: "Gold", emoji: "🥇", bg: "#CA8A04" },
  { key: "fuel", label: "Fuel", emoji: "⛽", bg: "#16A34A" },
  { key: "weather", label: "Weather", emoji: "⛅", bg: "#0EA5E9" },
  { key: "mandi", label: "Mandi", emoji: "🌾", bg: "#65A30D" },
  { key: "jobs", label: "Jobs", emoji: "💼", bg: "#DC2626" },
  { key: "bijli", label: "Electricity", emoji: "⚡", bg: "#EAB308" },
  { key: "schemes", label: "Schemes", emoji: "🏛️", bg: "#0F7B5A" },
];

const TITLES: Record<UtilityKey, string> = {
  horoscope: "Daily Horoscope",
  gold: "Gold & Silver Rates",
  fuel: "Fuel Prices",
  weather: "Weather",
  panchang: "Today's Panchang",
  jobs: "Jobs Near You",
  mandi: "Mandi Prices",
  bijli: "Electricity",
  commodities: "Commodities",
  schemes: "Government Schemes",
};

function Row({ cells, head }: { cells: string[]; head?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: "8px", padding: "10px 14px", borderBottom: `1px solid ${LINE}`, background: head ? WASH : PANEL }}>
      {cells.map((c, i) => (
        <span key={i} style={{ fontSize: head ? "11px" : "13px", fontWeight: head ? 700 : i === 0 ? 600 : 400, color: head ? INK_SOFT : INK, textTransform: head ? "uppercase" : "none", letterSpacing: head ? "0.05em" : undefined }}>
          {c}
        </span>
      ))}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: "12px", overflow: "hidden" }}>{children}</div>;
}

const RASHIS = [
  ["♈", "Aries", "A bold decision pays off. Money looks up in the afternoon."],
  ["♉", "Taurus", "Family time brings peace. Avoid arguments at work."],
  ["♊", "Gemini", "Great day for travel and new contacts."],
  ["♋", "Cancer", "Health needs care. Old friends reconnect."],
  ["♌", "Leo", "Recognition at work. Spend wisely."],
  ["♍", "Virgo", "Focus pays off. A pending task completes."],
  ["♎", "Libra", "Balance returns. Good news from family."],
  ["♏", "Scorpio", "Trust your instincts. Romance favoured."],
  ["♐", "Sagittarius", "Adventure calls. Keep documents safe."],
  ["♑", "Capricorn", "Steady gains. Avoid impulse buys."],
  ["♒", "Aquarius", "Creative ideas flow. Network today."],
  ["♓", "Pisces", "Calm mind, clear path. Help someone in need."],
];

export default function UtilityView({ service, district, onBack }: { service: UtilityKey; district: string; onBack: () => void }) {
  return (
    <div style={{ minHeight: "100%", background: WASH }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: BRAND, fontWeight: 700, fontSize: "14px", cursor: "pointer", marginBottom: "12px" }}>
          ‹ Back to news
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "26px" }}>{UTILITY_SERVICES.find((s) => s.key === service)?.emoji ?? "🗂️"}</span>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: INK }}>{TITLES[service]}</h1>
        </div>
        <p style={{ fontSize: "13px", color: INK_SOFT, marginBottom: "18px" }}>
          📍 {district} · updated just now
        </p>

        {service === "gold" && (
          <Card>
            <Row head cells={["Metal", "Per gram", "Per 10 g"]} />
            <Row cells={["Gold 24K", "₹7,412", "₹74,120"]} />
            <Row cells={["Gold 22K", "₹6,795", "₹67,950"]} />
            <Row cells={["Silver", "₹94", "₹940"]} />
          </Card>
        )}

        {(service === "fuel") && (
          <Card>
            <Row head cells={["City", "Petrol", "Diesel"]} />
            <Row cells={["Durgapur", "₹105.8", "₹92.4"]} />
            <Row cells={["Asansol", "₹105.6", "₹92.2"]} />
            <Row cells={["Kolkata", "₹106.0", "₹92.8"]} />
          </Card>
        )}

        {(service === "mandi" || service === "commodities") && (
          <Card>
            <Row head cells={["Crop", "Min", "Modal"]} />
            <Row cells={["Rice", "₹2,180", "₹2,340"]} />
            <Row cells={["Potato", "₹900", "₹1,150"]} />
            <Row cells={["Onion", "₹1,400", "₹1,720"]} />
            <Row cells={["Mustard", "₹5,050", "₹5,400"]} />
          </Card>
        )}

        {service === "weather" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Card>
              <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "40px", fontWeight: 800, color: INK }}>31°C</div>
                  <div style={{ fontSize: "14px", color: INK_SOFT }}>Partly cloudy · feels 35° · humidity 74%</div>
                </div>
                <div style={{ fontSize: "56px" }}>⛅</div>
              </div>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
              {[["Mon", "⛈️", "30°"], ["Tue", "🌧️", "29°"], ["Wed", "⛅", "31°"], ["Thu", "☀️", "33°"], ["Fri", "☀️", "34°"]].map((d) => (
                <div key={d[0]} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: "10px", padding: "12px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: INK_SOFT }}>{d[0]}</div>
                  <div style={{ fontSize: "22px", margin: "4px 0" }}>{d[1]}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: INK }}>{d[2]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {service === "panchang" && (
          <Card>
            {[
              ["Tithi", "Shukla Panchami"],
              ["Nakshatra", "Rohini"],
              ["Sunrise", "5:12 AM"],
              ["Sunset", "6:04 PM"],
              ["Rahu Kaal", "1:30 – 3:00 PM"],
              ["Yoga", "Siddha"],
            ].map((r, i, a) => (
              <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < a.length - 1 ? `1px solid ${LINE}` : "none" }}>
                <span style={{ fontSize: "13px", color: INK_SOFT }}>{r[0]}</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: INK }}>{r[1]}</span>
              </div>
            ))}
          </Card>
        )}

        {service === "horoscope" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
            {RASHIS.map((r) => (
              <div key={r[1]} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: "12px", padding: "14px", display: "flex", gap: "10px" }}>
                <span style={{ fontSize: "26px" }}>{r[0]}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: INK }}>{r[1]}</div>
                  <div style={{ fontSize: "12px", color: INK_SOFT, marginTop: "2px", lineHeight: 1.4 }}>{r[2]}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {service === "jobs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              ["Delivery Executive", "QuickMart", "₹18,000/mo", district],
              ["Data Entry Operator", "CSC Centre", "₹12,000/mo", district],
              ["Field Sales", "Jio Point", "₹15,000 + incentive", district],
              ["Security Guard", "SecureIndia", "₹14,500/mo", district],
            ].map((j, i) => (
              <div key={i} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: INK }}>{j[0]}</div>
                  <div style={{ fontSize: "12px", color: INK_SOFT }}>{j[1]} · {j[3]} · {j[2]}</div>
                </div>
                <button style={{ background: BRAND, color: "#fff", border: "none", borderRadius: "999px", padding: "8px 16px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Apply</button>
              </div>
            ))}
          </div>
        )}

        {service === "bijli" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Card>
              <Row head cells={["Area", "Outage", "Status"]} />
              <Row cells={["Benachity", "2:00 – 4:00 PM", "Scheduled"]} />
              <Row cells={["City Centre", "No outage", "Normal"]} />
              <Row cells={["Muchipara", "Restored 11:20 AM", "Normal"]} />
            </Card>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["Pay bill", "Report fault", "New connection"].map((a) => (
                <button key={a} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: "10px", padding: "12px 16px", fontWeight: 600, color: INK, cursor: "pointer" }}>{a}</button>
              ))}
            </div>
          </div>
        )}

        {service === "schemes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              ["PM-KISAN", "₹6,000/year to farmer families", "Agriculture"],
              ["Ayushman Bharat", "₹5 lakh health cover per family", "Health"],
              ["Kanyashree", "Support for girls' education (WB)", "Education"],
              ["Lakshmir Bhandar", "Monthly support for women (WB)", "Welfare"],
            ].map((s, i) => (
              <div key={i} style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: "12px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: INK }}>{s[0]}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: "#0F7B5A", padding: "2px 8px", borderRadius: "999px" }}>{s[2]}</span>
                </div>
                <div style={{ fontSize: "13px", color: INK_SOFT, marginTop: "4px" }}>{s[1]}</div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: "11px", color: INK_SOFT, marginTop: "18px" }}>
          Sample data shown. Connect a live data API to serve real-time rates and listings.
        </p>
      </div>
    </div>
  );
}
