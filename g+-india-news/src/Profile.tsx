import React, { useState, useEffect, useRef } from "react";

/**
 * G+ India News Brand Logo
 * Flat, geometric wordmark without bevels, shadows, or gradients.
 */
interface LogoProps {
  height?: number;
}

export function Logo({ height = 28 }: LogoProps) {
  const showSubtitle = height >= 20;

  // Intrinsic viewBox width/height
  const viewBoxWidth = showSubtitle ? 135 : 125;
  const viewBoxHeight = showSubtitle ? 126 : 90;
  const width = Math.round(height * (viewBoxWidth / viewBoxHeight));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="G+ India News Logo"
    >
      {/* Geometric 'G' in #E01B22 */}
      <path
        d="M 75.7 16.3 A 42 42 0 1 0 88 46 H 46 V 32 H 88 V 50 A 42 42 0 0 1 75.7 75.7 C 67.7 83.7 57.3 88 46 88 C 22.8 88 4 69.2 4 46 C 4 22.8 22.8 4 46 4 C 57.3 4 67.7 8.3 75.7 16.3 Z"
        fill="#E01B22"
      />

      {/* '+' overlapping G's lower-right in #E9ECF0 */}
      <path
        d="M 88 30 H 104 V 50 H 120 V 66 H 104 V 86 H 88 V 66 H 72 V 50 H 88 Z"
        fill="#E9ECF0"
      />

      {/* "INDIA NEWS" subtitle */}
      {showSubtitle && (
        <text
          x="4"
          y="118"
          fontFamily="Archivo, sans-serif"
          fontWeight="800"
          fontSize="22"
          letterSpacing="0.16em"
        >
          <tspan fill="#E9ECF0">INDIA</tspan>
          <tspan fill="#E01B22" dx="6">
            NEWS
          </tspan>
        </text>
      )}
    </svg>
  );
}

// Mock Data Models
interface ReportItem {
  id: string;
  headline: string;
  views: string;
  bgColour: string;
}

interface LiveItem {
  id: string;
  headline: string;
  watching: string;
  bgColour: string;
}

const REPORTS_DATA: ReportItem[] = [
  { id: "r1", headline: "Road caves in near Durgapur Steel Plant", views: "12.4K", bgColour: "#1B2A3D" },
  { id: "r2", headline: "Traders protest at Benachity market", views: "31.2K", bgColour: "#2E2340" },
  { id: "r3", headline: "সিটি সেন্টারে নতুন সরকারি হাসপাতাল ভবন", views: "8.1K", bgColour: "#10332C" },
  { id: "r4", headline: "Power cuts leave Muchipara residents stranded", views: "6.7K", bgColour: "#3D1F1F" },
  { id: "r5", headline: "Gandhi More jam traps school buses", views: "15.3K", bgColour: "#23301F" },
  { id: "r6", headline: "नगर निगम की सफाई गाड़ी दो हफ़्ते से बंद", views: "4.2K", bgColour: "#3A2E12" },
  { id: "r7", headline: "Water level rises at Durgapur Barrage", views: "22.8K", bgColour: "#1B2A3D" },
  { id: "r8", headline: "New flyover work begins, two-year target", views: "9.9K", bgColour: "#2E2340" },
  { id: "r9", headline: "Free health camp at local school", views: "3.1K", bgColour: "#10332C" },
];

const LIVE_DATA: LiveItem[] = [
  { id: "l1", headline: "Benachity market protest — live", watching: "1.2K watching", bgColour: "#3D1F1F" },
  { id: "l2", headline: "Municipal corporation press briefing", watching: "640 watching", bgColour: "#1B2A3D" },
];

interface ProfileProps {
  onBack?: () => void;
}

export default function Profile({ onBack }: ProfileProps = {}) {
  const [activeTab, setActiveTab] = useState<"reports" | "live" | "about">("reports");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const reportsTabRef = useRef<HTMLButtonElement | null>(null);
  const liveTabRef = useRef<HTMLButtonElement | null>(null);
  const aboutTabRef = useRef<HTMLButtonElement | null>(null);

  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // Update underline indicator position based on active tab
  useEffect(() => {
    let currentRef: HTMLButtonElement | null = null;
    if (activeTab === "reports") currentRef = reportsTabRef.current;
    else if (activeTab === "live") currentRef = liveTabRef.current;
    else if (activeTab === "about") currentRef = aboutTabRef.current;

    if (currentRef) {
      setUnderlineStyle({
        left: currentRef.offsetLeft,
        width: currentRef.offsetWidth,
      });
    }
  }, [activeTab]);

  // Handle scroll detection for compact header past 120px
  const handleScroll = () => {
    if (containerRef.current) {
      if (containerRef.current.scrollTop > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const followerCount = isFollowing ? "12.4K+1" : "12.4K";

  return (
    <div className="profile-backdrop">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;600&family=Anek+Devanagari:wght@400;600;700&family=Archivo:wght@400;500;600;700;800&display=swap');

        :root {
          --void: #000000;
          --panel: #0E1013;
          --panel-2: #171A1F;
          --line: #262A31;
          --chrome: #E9ECF0;
          --chrome-soft: #9AA1AB;
          --laal: #E01B22;
          --laal-deep: #8E0F14;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          background-color: var(--panel);
          color: var(--chrome);
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .profile-backdrop {
          width: 100%;
          min-height: 100vh;
          background-color: var(--panel);
          display: flex;
          justify-content: center;
        }

        .profile-shell {
          width: 100%;
          max-width: 430px;
          height: 100vh;
          background-color: var(--void);
          position: relative;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .profile-shell::-webkit-scrollbar {
          display: none;
        }

        /* Focus ring for accessibility */
        button:focus-visible,
        .grid-cell:focus-visible {
          outline: 2px solid var(--laal) !important;
          outline-offset: 2px !important;
        }

        /* Compact Header (Sticky past 120px) */
        .compact-header {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background-color: var(--panel);
          border-bottom: 1px solid var(--line);
          height: 52px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transform: translateY(-100%);
          opacity: 0;
          transition: transform 180ms ease, opacity 180ms ease;
          pointer-events: none;
        }

        .compact-header.visible {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .compact-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .compact-name {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: var(--chrome);
        }

        .compact-follow-btn {
          background-color: var(--laal);
          color: #FFFFFF;
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 11px;
          padding: 4px 12px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
        }

        .compact-follow-btn.following {
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          color: var(--chrome);
        }

        /* Header Section */
        .header-section {
          background-color: var(--panel);
          border-bottom: 1px solid var(--line);
          padding: 16px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .top-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-icon-btn {
          background: transparent;
          border: none;
          color: var(--chrome);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .nav-right-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .profile-identity-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 999px;
          background-color: var(--panel-2);
          border: 2px solid var(--laal);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 30px;
          color: var(--chrome);
        }

        .profile-name-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .profile-name {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: var(--chrome);
        }

        .verified-circle {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background-color: var(--laal);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .profile-handle {
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 13px;
          color: var(--chrome-soft);
        }

        .district-pill {
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 4px 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
        }

        .profile-bio {
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          font-size: 13px;
          color: var(--chrome-soft);
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Stats Row */
        .stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }

        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-divider {
          width: 1px;
          height: 24px;
          background-color: var(--line);
        }

        .stat-num {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--chrome);
        }

        .stat-label {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
        }

        /* Action Buttons Row */
        .profile-actions-row {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        .follow-main-btn {
          width: 65%;
          height: 44px;
          border-radius: 999px;
          background-color: var(--laal);
          color: #FFFFFF;
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 150ms ease, border-color 150ms ease;
        }

        .follow-main-btn.following {
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          color: var(--chrome);
        }

        .message-btn {
          flex: 1;
          height: 44px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Sticky Tabs Bar */
        .tabs-sticky-bar {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: var(--panel);
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          position: relative;
        }

        .tab-btn {
          flex: 1;
          height: 48px;
          background: transparent;
          border: none;
          color: var(--chrome-soft);
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: color 150ms ease;
        }

        .tab-btn.active {
          color: var(--chrome);
        }

        .tab-underline {
          position: absolute;
          bottom: 0;
          height: 2px;
          background-color: var(--laal);
          transition: left 200ms ease, width 200ms ease;
        }

        /* Tab Content Area */
        .tab-content-area {
          padding: 0;
          min-height: 400px;
          animation: tabFadeIn 150ms ease forwards;
        }

        @keyframes tabFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* TAB 1: REPORTS GRID */
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background-color: var(--void);
        }

        .grid-cell {
          aspect-ratio: 9/16;
          position: relative;
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          cursor: pointer;
          overflow: hidden;
        }

        .cell-headline {
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          font-weight: 600;
          font-size: 11px;
          color: #E9ECF0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
          margin-bottom: 6px;
        }

        .cell-views-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: #E9ECF0;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
        }

        /* TAB 2: LIVE CARDS */
        .live-tab-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .live-card {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 10px;
          padding: 12px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
        }

        .live-badge {
          align-self: flex-start;
          background-color: var(--laal);
          color: #FFFFFF;
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.1em;
          padding: 3px 8px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background-color: #FFFFFF;
          animation: pulseDot 1.4s infinite ease-in-out;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .live-card-bottom {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .live-headline {
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: #E9ECF0;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }

        .live-watching {
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: #E9ECF0;
          opacity: 0.85;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }

        /* TAB 3: ABOUT CARD */
        .about-tab-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .about-card {
          background-color: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          overflow: hidden;
        }

        .about-row {
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
        }

        .about-row:last-child {
          border-bottom: none;
        }

        .about-label {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
        }

        .about-value {
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          color: var(--chrome);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .report-account-btn {
          width: 100%;
          height: 48px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--chrome-soft);
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
        }

        /* Toast Popup */
        .toast-popup {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          padding: 10px 20px;
          border-radius: 999px;
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          z-index: 120;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <main className="profile-shell" ref={containerRef} onScroll={handleScroll}>
        {/* Compact Sticky Header (appears when scrolled past 120px) */}
        <div className={`compact-header ${isScrolled ? "visible" : ""}`}>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={onBack}
            aria-label="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="compact-title-row">
            <span className="compact-name">Balram Singh</span>
            <span className="verified-circle" style={{ width: "14px", height: "14px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>

          <button
            type="button"
            className={`compact-follow-btn ${isFollowing ? "following" : ""}`}
            onClick={() => setIsFollowing((f) => !f)}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Main Header Section */}
        <section className="header-section">
          {/* Top Nav Bar */}
          <div className="top-nav-bar">
            <button
              type="button"
              className="nav-icon-btn"
              onClick={onBack}
              aria-label="Back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="nav-right-actions">
              <button
                type="button"
                className="nav-icon-btn"
                aria-label="Share profile"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "Balram Singh - G+ India News", url: window.location.href }).catch(() => {});
                  } else {
                    showToast("Link copied to clipboard");
                  }
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>

              <button
                type="button"
                className="nav-icon-btn"
                aria-label="More options"
                onClick={() => showToast("Profile options opened")}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Profile Identity */}
          <div className="profile-identity-row">
            <div className="profile-avatar">B</div>

            <div className="profile-name-wrap">
              <h1 className="profile-name">Balram Singh</h1>
              <span className="verified-circle">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </div>

            <div className="profile-handle">@balram_durgapur</div>

            <div className="district-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--laal)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Durgapur, West Bengal</span>
            </div>

            <p className="profile-bio">
              Local news from Durgapur. Roads, power, water — whatever is happening in your neighbourhood, I show it.
            </p>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-num">{followerCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">384</span>
              <span className="stat-label">Reports</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">2.1M</span>
              <span className="stat-label">Views</span>
            </div>
          </div>

          {/* Actions Row */}
          <div className="profile-actions-row">
            <button
              type="button"
              className={`follow-main-btn ${isFollowing ? "following" : ""}`}
              onClick={() => setIsFollowing((f) => !f)}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              type="button"
              className="message-btn"
              onClick={() => showToast("Messaging feature opened")}
            >
              Message
            </button>
          </div>
        </section>

        {/* Tabs Bar */}
        <div className="tabs-sticky-bar" role="tablist">
          <button
            ref={reportsTabRef}
            type="button"
            role="tab"
            aria-selected={activeTab === "reports"}
            className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports (12)
          </button>
          <button
            ref={liveTabRef}
            type="button"
            role="tab"
            aria-selected={activeTab === "live"}
            className={`tab-btn ${activeTab === "live" ? "active" : ""}`}
            onClick={() => setActiveTab("live")}
          >
            Live (2)
          </button>
          <button
            ref={aboutTabRef}
            type="button"
            role="tab"
            aria-selected={activeTab === "about"}
            className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>

          <div
            className="tab-underline"
            style={{
              left: `${underlineStyle.left}px`,
              width: `${underlineStyle.width}px`,
            }}
          />
        </div>

        {/* Tab Content */}
        <div className="tab-content-area">
          {/* TAB 1: REPORTS */}
          {activeTab === "reports" && (
            <div className="reports-grid" key="reports-grid">
              {REPORTS_DATA.map((item) => (
                <div
                  key={item.id}
                  className="grid-cell"
                  style={{ backgroundColor: item.bgColour }}
                  tabIndex={0}
                  onClick={() => showToast(`Playing "${item.headline}"`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      showToast(`Playing "${item.headline}"`);
                    }
                  }}
                  role="button"
                  aria-label={`Report: ${item.headline}`}
                >
                  <p className="cell-headline">{item.headline}</p>
                  <div className="cell-views-row">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>{item.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: LIVE */}
          {activeTab === "live" && (
            <div className="live-tab-container" key="live-container">
              {LIVE_DATA.map((item) => (
                <div
                  key={item.id}
                  className="live-card"
                  style={{ backgroundColor: item.bgColour }}
                  onClick={() => showToast(`Opening live stream "${item.headline}"`)}
                >
                  <div className="live-badge">
                    <span className="live-dot" />
                    LIVE
                  </div>

                  <div className="live-card-bottom">
                    <h3 className="live-headline">{item.headline}</h3>
                    <div className="live-watching">{item.watching}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ABOUT */}
          {activeTab === "about" && (
            <div className="about-tab-container" key="about-container">
              <div className="about-card">
                <div className="about-row">
                  <span className="about-label">Joined</span>
                  <span className="about-value">March 2023</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Covers</span>
                  <span className="about-value">Durgapur, Asansol, Bardhaman</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Reports in</span>
                  <span className="about-value">Bengali, Hindi</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Verification</span>
                  <span className="about-value">
                    Verified at district level
                    <span className="verified-circle" style={{ width: "14px", height: "14px", marginLeft: "4px" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="report-account-btn"
                onClick={() => showToast("Account reported for review")}
              >
                Report this account
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && <div className="toast-popup">{toastMessage}</div>}
    </div>
  );
}
