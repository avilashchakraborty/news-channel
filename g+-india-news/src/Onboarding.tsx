import React, { useState, useId, useRef } from "react";

/**
 * G+ India News Brand Logo
 * Flat, geometric wordmark without bevels, shadows, or gradients.
 */
interface LogoProps {
  height?: number;
}

export function Logo({ height = 28 }: LogoProps) {
  const showSubtitle = height >= 20;

  // Calculate scaled dimensions based on intrinsic viewBox
  // Glyphs only: 0 0 125 90. With subtitle: 0 0 135 126
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

// Mock Types & Data
export interface Language {
  id: string;
  script: string;
  english: string;
  fontClass?: string;
}

export interface District {
  id: string;
  native: string;
  english: string;
  state: string;
}

export interface StateGroup {
  state: string;
  districts: { native: string; english: string }[];
}

const LANGUAGES: Language[] = [
  { id: "en", script: "English", english: "English", fontClass: "font-archivo" },
  { id: "hi", script: "हिन्दी", english: "Hindi", fontClass: "font-devanagari" },
  { id: "bn", script: "বাংলা", english: "Bengali", fontClass: "font-bangla" },
  { id: "mr", script: "मराठी", english: "Marathi", fontClass: "font-devanagari" },
  { id: "gu", script: "ગુજરાતી", english: "Gujarati" },
  { id: "te", script: "తెలుగు", english: "Telugu" },
  { id: "ta", script: "தமிழ்", english: "Tamil" },
  { id: "kn", script: "ಕನ್ನಡ", english: "Kannada" },
];

const MOCK_STATES: StateGroup[] = [
  {
    state: "West Bengal",
    districts: [
      { native: "দুর্গাপুর", english: "Durgapur" },
      { native: "আসানসোল", english: "Asansol" },
      { native: "কলকাতা", english: "Kolkata" },
      { native: "পুরুলিয়া", english: "Purulia" },
      { native: "বাঁকুড়া", english: "Bankura" },
    ],
  },
  {
    state: "Bihar",
    districts: [
      { native: "पटना", english: "Patna" },
      { native: "गया", english: "Gaya" },
      { native: "मुज़फ़्फ़रपुर", english: "Muzaffarpur" },
    ],
  },
  {
    state: "Uttar Pradesh",
    districts: [
      { native: "लखनऊ", english: "Lucknow" },
      { native: "वाराणसी", english: "Varanasi" },
      { native: "कानपुर", english: "Kanpur" },
      { native: "मेरठ", english: "Meerut" },
    ],
  },
  {
    state: "Jharkhand",
    districts: [
      { native: "रांची", english: "Ranchi" },
      { native: "धनबाद", english: "Dhanbad" },
      { native: "जमशेदपुर", english: "Jamshedpur" },
    ],
  },
  {
    state: "Himachal Pradesh",
    districts: [
      { native: "कुल्लू", english: "Kullu" },
      { native: "शिमला", english: "Shimla" },
      { native: "मंडी", english: "Mandi" },
    ],
  },
];

interface OnboardingProps {
  onComplete?: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps = {}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [completed, setCompleted] = useState(false);

  const districtItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const searchInputId = useId();

  // Handle location auto-detect
  const handleUseLocation = () => {
    if (isLocating) return;
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      const durgapur: District = {
        id: "durgapur",
        native: "দুর্গাপুর",
        english: "Durgapur",
        state: "West Bengal",
      };
      setSelectedDistrict(durgapur);
      // Scroll into view if element ref exists
      const targetEl = districtItemRefs.current["Durgapur"];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 1200);
  };

  // Filter district list based on query (live on both English & native names)
  const filteredStates = MOCK_STATES.map((group) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return group;
    const matchingDistricts = group.districts.filter(
      (d) =>
        d.native.toLowerCase().includes(q) ||
        d.english.toLowerCase().includes(q) ||
        group.state.toLowerCase().includes(q)
    );
    return { ...group, districts: matchingDistricts };
  }).filter((group) => group.districts.length > 0);

  const hasSearchResults = filteredStates.some((g) => g.districts.length > 0);

  return (
    <div className="app-backdrop">
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
          background-color: var(--void);
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .font-archivo {
          font-family: 'Archivo', sans-serif;
        }

        .font-devanagari {
          font-family: 'Anek Devanagari', sans-serif;
        }

        .font-bangla {
          font-family: 'Anek Bangla', sans-serif;
        }

        .app-backdrop {
          width: 100%;
          min-height: 100vh;
          background-color: var(--void);
          display: flex;
          justify-content: center;
        }

        .app-shell {
          width: 100%;
          max-width: 430px;
          min-height: 100vh;
          background-color: var(--void);
          display: flex;
          flex-direction: column;
          position: relative;
          padding-bottom: 90px;
        }

        /* Focus rings for keyboard accessibility */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid var(--laal) !important;
          outline-offset: 2px !important;
        }

        /* Progress Bar */
        .progress-bar-container {
          position: sticky;
          top: 0;
          z-index: 50;
          background-color: var(--void);
          padding: 16px 20px 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .progress-segment {
          height: 3px;
          border-radius: 2px;
          background-color: var(--line);
          overflow: hidden;
        }

        .progress-segment-fill {
          height: 100%;
          background-color: var(--laal);
          transition: width 200ms ease;
        }

        /* Step Transitions */
        .step-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 0 20px;
          animation: stepFadeIn 180ms ease forwards;
        }

        @keyframes stepFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* STEP 1 STYLES */
        .logo-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 40px;
          margin-bottom: 24px;
        }

        .tagline {
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 13px;
          color: var(--chrome-soft);
          letter-spacing: 0.04em;
          text-align: center;
          margin-top: 12px;
        }

        .step-heading {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 1.2;
          color: var(--chrome);
          margin-bottom: 6px;
          text-align: left;
        }

        .step-helper {
          font-family: 'Archivo', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 1.45;
          color: var(--chrome-soft);
          margin-bottom: 20px;
          text-align: left;
        }

        .language-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .lang-card {
          background-color: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          cursor: pointer;
          text-align: left;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .lang-card.selected {
          background-color: var(--panel-2);
          border: 2px solid var(--laal);
        }

        .lang-english {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          line-height: 1.2;
          color: var(--chrome);
          margin-bottom: 4px;
        }

        .lang-script {
          font-size: 18px;
          line-height: 1.2;
          color: var(--chrome-soft);
        }

        /* Sticky Action Footer */
        .action-footer {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          background-color: var(--void);
          padding: 16px 20px 24px;
          z-index: 40;
          border-top: 1px solid var(--line);
        }

        .primary-button {
          width: 100%;
          height: 52px;
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
          transition: opacity 150ms ease;
        }

        .primary-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* STEP 2 STYLES */
        .step2-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          margin-bottom: 4px;
        }

        .back-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          margin-left: -4px;
          color: var(--chrome);
          border-radius: 6px;
        }

        .step2-heading {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 24px;
          line-height: 1.2;
          color: var(--chrome);
        }

        .location-row {
          width: 100%;
          background-color: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          margin-top: 16px;
          margin-bottom: 16px;
          text-align: left;
        }

        .location-text {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: var(--laal);
        }

        .search-box {
          background-color: var(--panel-2);
          border-radius: 10px;
          height: 46px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-size: 15px;
        }

        .search-input::placeholder {
          color: var(--chrome-soft);
        }

        /* District List */
        .district-list-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .state-group {
          display: flex;
          flex-direction: column;
        }

        .state-header {
          position: sticky;
          top: 35px;
          background-color: var(--void);
          color: var(--chrome-soft);
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 10px 0;
          border-bottom: 1px solid var(--line);
          z-index: 10;
        }

        .district-item {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--line);
          padding: 14px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          width: 100%;
          transition: background-color 150ms ease;
        }

        .district-item.selected {
          background-color: var(--panel-2);
          border-radius: 6px;
        }

        .district-name-en {
          font-family: 'Archivo', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--chrome);
          line-height: 1.25;
        }

        .district-meta {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
          line-height: 1.3;
          margin-top: 2px;
        }

        .empty-state {
          padding: 40px 12px;
          text-align: center;
        }

        .empty-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 18px;
          color: var(--chrome);
          margin-bottom: 8px;
        }

        .empty-sub {
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          color: var(--chrome-soft);
          line-height: 1.45;
        }

        /* STEP 3 STYLES */
        .step3-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-top: 36px;
        }

        .pin-svg-container {
          margin-top: 24px;
          margin-bottom: 20px;
        }

        .ready-heading {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: var(--chrome);
          margin-bottom: 12px;
        }

        .ready-body {
          font-family: 'Archivo', sans-serif;
          font-size: 15px;
          color: var(--chrome-soft);
          line-height: 1.45;
          max-width: 320px;
          margin-bottom: 32px;
        }

        .secondary-btn {
          background: transparent;
          border: none;
          color: var(--chrome-soft);
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          margin-top: 16px;
          padding: 8px 16px;
          border-radius: 999px;
        }

        .completion-toast {
          margin-top: 20px;
          padding: 12px 20px;
          background-color: var(--panel-2);
          border: 1px solid var(--laal);
          border-radius: 10px;
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-size: 15px;
          text-align: center;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Reduced motion media query */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <main className="app-shell">
        {/* Pinned 3-Segment Progress Bar */}
        <div className="progress-bar-container" aria-label="Progress bar">
          <div className="progress-segment">
            <div
              className="progress-segment-fill"
              style={{ width: step >= 1 ? "100%" : "0%" }}
            />
          </div>
          <div className="progress-segment">
            <div
              className="progress-segment-fill"
              style={{ width: step >= 2 ? "100%" : "0%" }}
            />
          </div>
          <div className="progress-segment">
            <div
              className="progress-segment-fill"
              style={{ width: step >= 3 ? "100%" : "0%" }}
            />
          </div>
        </div>

        {/* STEP 1 — Language Selection */}
        {step === 1 && (
          <div className="step-container" key="step1">
            <div className="logo-header">
              <Logo height={64} />
              <p className="tagline">Your district. Your news. Your voice.</p>
            </div>

            <h1 className="step-heading">Choose your language</h1>
            <p className="step-helper">
              This sets the app's language. You'll still see news from reporters in every language.
            </p>

            <div className="language-grid" role="radiogroup" aria-label="Choose language">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage.id === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`lang-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    <span className="lang-english">{lang.english}</span>
                    <span className={`lang-script ${lang.fontClass || ""}`}>{lang.script}</span>
                  </button>
                );
              })}
            </div>

            <div className="action-footer">
              <button
                type="button"
                className="primary-button"
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — District Selection */}
        {step === 2 && (
          <div className="step-container" key="step2">
            <div className="step2-header">
              <button
                type="button"
                className="back-btn"
                onClick={() => setStep(1)}
                aria-label="Previous step"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--chrome)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h1 className="step2-heading">Pick your district</h1>
            </div>

            <p className="step-helper">You can change this any time from the feed.</p>

            {/* Use My Location Button */}
            <button
              type="button"
              className="location-row"
              onClick={handleUseLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <svg
                  className="spin-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--laal)"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--laal)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              )}
              <span className="location-text">Use my location</span>
            </button>

            {/* Search Input */}
            <div className="search-box">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--chrome-soft)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <label htmlFor={searchInputId} className="sr-only" style={{ display: 'none' }}>
                Search district or city
              </label>
              <input
                id={searchInputId}
                type="text"
                className="search-input"
                placeholder="Search district or city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Scrollable Grouped District List */}
            {hasSearchResults ? (
              <div className="district-list-container">
                {filteredStates.map((group) => (
                  <div key={group.state} className="state-group">
                    <div className="state-header">{group.state}</div>
                    {group.districts.map((d) => {
                      const isSelected = selectedDistrict?.english === d.english;
                      return (
                        <button
                          key={d.english}
                          ref={(el) => (districtItemRefs.current[d.english] = el)}
                          type="button"
                          className={`district-item ${isSelected ? "selected" : ""}`}
                          onClick={() =>
                            setSelectedDistrict({
                              id: d.english.toLowerCase(),
                              native: d.native,
                              english: d.english,
                              state: group.state,
                            })
                          }
                        >
                          <div>
                            <div className="district-name-en">{d.english}</div>
                            <div className="district-meta">
                              {d.native} · {group.state}
                            </div>
                          </div>
                          {isSelected && (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--laal)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-title">No district found</div>
                <div className="empty-sub">
                  Check the spelling, or pick your state from the list.
                </div>
              </div>
            )}

            <div className="action-footer">
              <button
                type="button"
                className="primary-button"
                disabled={!selectedDistrict}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Ready / Confirmation */}
        {step === 3 && (
          <div className="step-container step3-content" key="step3">
            <Logo height={56} />

            {/* 96px Map Pin SVG with Circular Counter cut by '+' */}
            <div className="pin-svg-container">
              <svg
                width="96"
                height="96"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Map pin outer body in --laal (#E01B22) */}
                <path
                  d="M 48 4 C 30.3 4 16 18.3 16 36 C 16 58 48 92 48 92 C 48 92 80 58 80 36 C 80 18.3 65.7 4 48 4 Z"
                  fill="#E01B22"
                />
                {/* Circular counter cut (black circle cutout) */}
                <circle cx="48" cy="36" r="16" fill="#000000" />
                {/* '+' symbol inside counter in --chrome (#E9ECF0) */}
                <path
                  d="M 44 26 H 52 V 32 H 58 V 40 H 52 V 46 H 44 V 40 H 38 V 32 H 44 Z"
                  fill="#E9ECF0"
                />
              </svg>
            </div>

            <h1 className="ready-heading">You're set</h1>

            <p className="ready-body">
              You'll see news from {selectedDistrict?.english || "Durgapur"}, with the app in {selectedLanguage.english}.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setCompleted(true);
                onComplete?.();
              }}
            >
              Open the feed
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setCompleted(false);
                setStep(1);
              }}
            >
              Change settings
            </button>

            {completed && (
              <div className="completion-toast">
                App onboarding complete.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
