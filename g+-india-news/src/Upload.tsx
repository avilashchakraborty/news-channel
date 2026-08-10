import React, { useState, useRef, useEffect, useId } from "react";

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

const SUGGESTED_TAGS = [
  "roads",
  "power",
  "water",
  "schools",
  "hospitals",
  "police",
  "durgapur",
];

const CATEGORIES = ["Civic", "Crime", "Politics", "Sport", "Weather"];

interface UploadProps {
  onGoToFeed?: () => void;
  onBack?: () => void;
}

export default function Upload({ onGoToFeed, onBack }: UploadProps = {}) {
  // Navigation step: 1 (Pick), 2 (Details), 3 (Uploading/Success)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Selected File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Step 2: Form fields
  const [headline, setHeadline] = useState("");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("Durgapur, West Bengal");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [consentChecked, setConsentChecked] = useState(false);

  // Validation state
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Step 3: Upload progress & timer
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const headlineInputId = useId();
  const detailsInputId = useId();
  const tagsInputId = useId();

  // Clean up object URL on unmount or file replace
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Handle file selection from input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setStep(2);
    }
  };

  // Handle mock video drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setStep(2);
    }
  };

  // Tag management
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!clean) return;
    if (tags.length < 5 && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Validation helpers
  const isHeadlineValid = headline.trim().length >= 10;
  const isCategoryValid = category !== "";
  const isConsentValid = consentChecked;
  const canPost = isHeadlineValid && isCategoryValid && isConsentValid;

  // Handle form submit
  const handlePostSubmit = () => {
    setSubmitAttempted(true);
    if (!canPost) return;

    setStep(3);
    setUploadProgress(0);
    setIsUploadComplete(false);

    // Simulate upload using requestAnimationFrame over 4 seconds
    const startTime = performance.now();
    const duration = 4000; // 4 seconds

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setUploadProgress(progress);

      if (progress < 100) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsUploadComplete(true);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleCancelUpload = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setStep(2);
  };

  const handleResetAll = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setSelectedFile(null);
    setVideoUrl(null);
    setHeadline("");
    setDetails("");
    setTags([]);
    setCategory("");
    setConsentChecked(false);
    setSubmitAttempted(false);
    setUploadProgress(0);
    setIsUploadComplete(false);
    setStep(1);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Stage label calculation based on progress threshold
  const getStageLabel = (progress: number) => {
    if (progress < 40) return "Uploading video";
    if (progress < 80) return "Processing";
    return "Sending for review";
  };

  // Circular SVG ring math (120px diameter, 6px stroke)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (uploadProgress / 100) * circumference;

  return (
    <div className="upload-backdrop">
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

        .upload-backdrop {
          width: 100%;
          min-height: 100vh;
          background-color: var(--panel);
          display: flex;
          justify-content: center;
        }

        .upload-shell {
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
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid var(--laal) !important;
          outline-offset: 2px !important;
        }

        /* Top Header */
        .upload-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: var(--panel);
          border-bottom: 1px solid var(--line);
          height: 56px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left-btn {
          background: transparent;
          border: none;
          color: var(--chrome);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 6px;
        }

        .header-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--chrome);
          text-align: center;
          flex: 1;
        }

        .header-placeholder {
          width: 28px;
        }

        .step-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 20px;
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

        /* STEP 1: DROP ZONE */
        .drop-zone {
          background-color: var(--panel);
          border: 1.5px dashed var(--line);
          border-radius: 10px;
          height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-bottom: 24px;
          transition: border-color 150ms ease, background-color 150ms ease;
        }

        .drop-zone:hover {
          border-color: var(--laal);
          background-color: var(--panel-2);
        }

        .drop-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: var(--chrome);
          margin-top: 12px;
          margin-bottom: 4px;
        }

        .drop-subtitle {
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: var(--chrome-soft);
        }

        /* Rules Card */
        .rules-card {
          background-color: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rules-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: var(--chrome);
        }

        .rule-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          color: var(--chrome-soft);
          line-height: 1.4;
        }

        .rule-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* STEP 2: PREVIEW & FORM */
        .preview-container {
          width: 100%;
          aspect-ratio: 16/9;
          background-color: var(--void);
          border: 1px solid var(--line);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .preview-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .preview-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .preview-file-info {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 280px;
        }

        .replace-btn {
          background: transparent;
          border: none;
          color: var(--laal);
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
          position: relative;
        }

        .form-label {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: var(--chrome);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          background-color: var(--panel-2);
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 12px 14px;
          color: var(--chrome);
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          font-size: 13px;
          transition: border-color 150ms ease;
        }

        .form-textarea {
          font-size: 15px;
          resize: none;
          line-height: 1.4;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: var(--chrome-soft);
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: var(--laal);
          outline: none;
        }

        .char-counter {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
          align-self: flex-end;
          margin-top: 2px;
        }

        .char-counter.near-limit {
          color: var(--laal);
        }

        .read-only-field {
          background-color: var(--panel-2);
          border-radius: 10px;
          height: 46px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .location-value {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          color: var(--chrome);
        }

        .change-btn {
          background: transparent;
          border: none;
          color: var(--laal);
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
        }

        /* Tags */
        .tags-chips-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
          margin-bottom: 6px;
        }

        .tag-pill {
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 4px 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome);
        }

        .tag-remove-btn {
          background: transparent;
          border: none;
          color: var(--chrome-soft);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .suggested-tags-title {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
          margin-top: 4px;
          margin-bottom: 6px;
        }

        .suggested-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggested-tag-btn {
          background: transparent;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 3px 10px;
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
          cursor: pointer;
          transition: border-color 150ms ease, color 150ms ease;
        }

        .suggested-tag-btn:hover {
          border-color: var(--chrome-soft);
          color: var(--chrome);
        }

        /* Category Row */
        .category-pills-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
        }

        .category-pills-row::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          background: transparent;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 16px;
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 13px;
          color: var(--chrome-soft);
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
        }

        .category-pill.selected {
          background-color: var(--laal);
          border-color: var(--laal);
          color: #FFFFFF;
          font-weight: 600;
        }

        /* Consent Row */
        .consent-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
          margin-bottom: 24px;
          cursor: pointer;
        }

        .custom-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid var(--line);
          background-color: var(--panel-2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 150ms ease, border-color 150ms ease;
        }

        .custom-checkbox.checked {
          background-color: var(--laal);
          border-color: var(--laal);
        }

        .consent-label {
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          color: var(--chrome);
          line-height: 1.35;
        }

        /* Validation Error Message */
        .field-error-msg {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--laal);
          margin-top: 4px;
        }

        /* Action Footer */
        .action-footer {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 430px;
          background-color: var(--panel);
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

        /* STEP 3: UPLOADING & SUCCESS */
        .step3-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding-top: 60px;
          flex: 1;
        }

        .progress-ring-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-percentage {
          position: absolute;
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: var(--chrome);
        }

        .stage-label {
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          color: var(--chrome-soft);
          margin-bottom: 24px;
        }

        .cancel-btn {
          background: transparent;
          border: none;
          color: var(--chrome-soft);
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
        }

        /* Success View */
        .success-circle {
          width: 64px;
          height: 64px;
          border-radius: 999px;
          background-color: var(--laal);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 24px;
          margin-bottom: 20px;
        }

        .success-heading {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: var(--chrome);
          margin-bottom: 12px;
        }

        .success-body {
          font-family: 'Archivo', sans-serif;
          font-size: 15px;
          color: var(--chrome-soft);
          line-height: 1.45;
          max-width: 320px;
          margin-bottom: 32px;
        }

        .outline-button {
          width: 100%;
          height: 52px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          margin-top: 12px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <main className="upload-shell">
        {/* Header */}
        <header className="upload-header">
          <button
            type="button"
            className="header-left-btn"
            onClick={() => {
              if (step === 2) setStep(1);
              else if (step === 1 && onBack) onBack();
              else if (onGoToFeed) onGoToFeed();
            }}
            aria-label="Back"
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
          <h1 className="header-title">Post news</h1>
          <div className="header-placeholder" />
        </header>

        {/* STEP 1: PICK A VIDEO */}
        {step === 1 && (
          <div className="step-container" key="step1">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Drop Zone */}
            <div
              className="drop-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Choose a video file"
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--laal)" strokeWidth="3" strokeLinecap="square">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <div className="drop-title">Choose a video</div>
              <div className="drop-subtitle">Up to 60 seconds · MP4 or MOV</div>
            </div>

            {/* What Makes a Good Report Rules Card */}
            <div className="rules-card">
              <h2 className="rules-title">What makes a good report</h2>
              <div className="rule-item">
                <svg className="rule-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--laal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Hold the phone steady and upright</span>
              </div>
              <div className="rule-item">
                <svg className="rule-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--laal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Say the place and the date clearly</span>
              </div>
              <div className="rule-item">
                <svg className="rule-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--laal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Report what you saw, not what you heard</span>
              </div>
              <div className="rule-item">
                <svg className="rule-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--laal)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Don't show faces or private details without permission</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {step === 2 && (
          <div className="step-container" key="step2">
            {/* 16:9 Video Preview */}
            <div className="preview-container">
              {videoUrl && (
                <video
                  src={videoUrl}
                  controls
                  muted
                  className="preview-video"
                />
              )}
            </div>

            <div className="preview-meta-row">
              <span className="preview-file-info">
                {selectedFile ? selectedFile.name : "sample_news.mp4"} · {formatFileSize(selectedFile?.size || 14200000)}
              </span>
              <button
                type="button"
                className="replace-btn"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                Replace
              </button>
            </div>

            {/* Form Fields */}

            {/* 1. Headline */}
            <div className="form-group">
              <label htmlFor={headlineInputId} className="form-label">
                <span>Headline</span>
              </label>
              <textarea
                id={headlineInputId}
                className="form-textarea"
                rows={2}
                maxLength={120}
                placeholder="What happened, in one line"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <span className={`char-counter ${headline.length > 110 ? "near-limit" : ""}`}>
                {headline.length}/120
              </span>
              {submitAttempted && !isHeadlineValid && (
                <div className="field-error-msg">
                  Headline needs at least 10 characters
                </div>
              )}
            </div>

            {/* 2. Details */}
            <div className="form-group">
              <label htmlFor={detailsInputId} className="form-label">
                <span>Details</span>
              </label>
              <textarea
                id={detailsInputId}
                className="form-textarea"
                rows={4}
                maxLength={400}
                placeholder="Where, when, and who was involved"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <span className={`char-counter ${details.length > 370 ? "near-limit" : ""}`}>
                {details.length}/400
              </span>
            </div>

            {/* 3. Location */}
            <div className="form-group">
              <span className="form-label">Location</span>
              <div className="read-only-field">
                <div className="location-value">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--laal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{location}</span>
                </div>
                <button
                  type="button"
                  className="change-btn"
                  onClick={() => setLocation("Durgapur, West Bengal")}
                >
                  Change
                </button>
              </div>
            </div>

            {/* 4. Tags */}
            <div className="form-group">
              <label htmlFor={tagsInputId} className="form-label">
                <span>Tags</span>
              </label>
              <input
                id={tagsInputId}
                type="text"
                className="form-input"
                placeholder="Add a tag and press enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={tags.length >= 5}
              />
              {tags.length >= 5 && (
                <span className="char-counter">Up to 5 tags</span>
              )}

              {/* Tag Chips */}
              {tags.length > 0 && (
                <div className="tags-chips-wrapper">
                  {tags.map((t) => (
                    <span key={t} className="tag-pill">
                      #{t}
                      <button
                        type="button"
                        className="tag-remove-btn"
                        onClick={() => handleRemoveTag(t)}
                        aria-label={`Remove tag ${t}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Tags */}
              <div className="suggested-tags-title">Suggested tags</div>
              <div className="suggested-tags-row">
                {SUGGESTED_TAGS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    className="suggested-tag-btn"
                    onClick={() => handleAddTag(st)}
                  >
                    #{st}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Category */}
            <div className="form-group">
              <span className="form-label">Category</span>
              <div className="category-pills-row" role="radiogroup" aria-label="Category selection">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`category-pill ${isSelected ? "selected" : ""}`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              {submitAttempted && !isCategoryValid && (
                <div className="field-error-msg">
                  Select a category for your report
                </div>
              )}
            </div>

            {/* Consent Row */}
            <div
              className="consent-row"
              onClick={() => setConsentChecked((c) => !c)}
              role="checkbox"
              aria-checked={consentChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setConsentChecked((c) => !c);
                }
              }}
            >
              <div className={`custom-checkbox ${consentChecked ? "checked" : ""}`}>
                {consentChecked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="consent-label">
                This is my own video of a real event
              </span>
            </div>
            {submitAttempted && !isConsentValid && (
              <div className="field-error-msg" style={{ marginTop: "-16px", marginBottom: "16px" }}>
                Confirm that this is your own video
              </div>
            )}

            {/* Sticky Action Footer */}
            <div className="action-footer">
              <button
                type="button"
                className="primary-button"
                disabled={!canPost}
                onClick={handlePostSubmit}
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: UPLOADING & DONE */}
        {step === 3 && (
          <div className="step-container step3-content" key="step3">
            {!isUploadComplete ? (
              <>
                {/* Circular Progress Ring */}
                <div className="progress-ring-container">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="var(--line)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="var(--laal)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="progress-percentage">
                    {Math.round(uploadProgress)}%
                  </div>
                </div>

                <div className="stage-label">{getStageLabel(uploadProgress)}</div>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelUpload}
                >
                  Cancel
                </button>
              </>
            ) : (
              /* Success View */
              <>
                <Logo height={44} />

                <div className="success-circle">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h1 className="success-heading">Posted</h1>

                <p className="success-body">
                  Your report will appear in the Durgapur feed within 10 to 15 minutes, once it clears review.
                </p>

                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      if (onGoToFeed) onGoToFeed();
                      else handleResetAll();
                    }}
                  >
                    Go to feed
                  </button>

                  <button
                    type="button"
                    className="outline-button"
                    onClick={handleResetAll}
                  >
                    Post another
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
