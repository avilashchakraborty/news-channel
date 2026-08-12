import React, { useState, useEffect, useRef } from "react";
import Portal from "./Portal";
import Advertiser from "./Advertiser";
import { AdPlacements, DEFAULT_AD_PLACEMENTS } from "./adConfig";

// ==========================================
// RESPONSIVE HELPER
// ==========================================

// Tracks the viewport width so each screen can adapt its layout
// between desktop (multi-column) and mobile (stacked) presentations.
function useViewportWidth() {
  const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

// ==========================================
// SHARED PRIMITIVES
// ==========================================

export function Logo({ height = 28 }: { height?: number }) {
  const showSubtitle = height >= 20;
  const viewBoxWidth = showSubtitle ? 135 : 125;
  const viewBoxHeight = showSubtitle ? 126 : 90;
  const width = Math.round(height * (viewBoxWidth / viewBoxHeight));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} fill="none" role="img" aria-label="G+ India News Logo">
      <path d="M 75.7 16.3 A 42 42 0 1 0 88 46 H 46 V 32 H 88 V 50 A 42 42 0 0 1 75.7 75.7 C 67.7 83.7 57.3 88 46 88 C 22.8 88 4 69.2 4 46 C 4 22.8 22.8 4 46 4 C 57.3 4 67.7 8.3 75.7 16.3 Z" fill="var(--brand)" />
      <path d="M 88 30 H 104 V 50 H 120 V 66 H 104 V 86 H 88 V 66 H 72 V 50 H 88 Z" fill="#E9ECF0" />
      {showSubtitle && (
        <text x="4" y="118" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="22" letterSpacing="0.16em">
          <tspan fill="#E9ECF0">INDIA</tspan>
          <tspan fill="var(--brand)" dx="6">NEWS</tspan>
        </text>
      )}
    </svg>
  );
}

export function TenantLogo({ tenantId, height = 28 }: { tenantId: string; height?: number }) {
  let glyph = "G";
  let word1 = "INDIA";
  let word2 = "NEWS";
  let color = "#E01B22";

  if (tenantId === "bangla-khabor") {
    glyph = "B";
    word1 = "BANGLA";
    word2 = "KHABOR";
    color = "#0F7B5A";
  } else if (tenantId === "purvanchal") {
    glyph = "P";
    word1 = "PURVANCHAL";
    word2 = "LIVE";
    color = "#B45309";
  }

  const showSubtitle = height >= 20;
  const viewBoxWidth = showSubtitle ? 160 : 90;
  const viewBoxHeight = showSubtitle ? 126 : 90;
  const width = Math.round(height * (viewBoxWidth / viewBoxHeight));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} fill="none" role="img" aria-label={`${word1} ${word2} Logo`}>
      <circle cx="45" cy="45" r="40" fill={color} />
      <text x="45" y="60" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="48" fill="#E9ECF0">
        {glyph}
      </text>
      {tenantId === "bangla-khabor" && <circle cx="45" cy="18" r="6" fill="#E9ECF0" />}
      {tenantId === "purvanchal" && <path d="M 37 20 L 45 10 L 53 20" stroke="#E9ECF0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      {tenantId === "gplus" && <path d="M 60 30 H 72 V 42 H 84 V 54 H 72 V 66 H 60 V 54 H 48 V 42 H 60 Z" fill="#E9ECF0" />}
      {showSubtitle && (
        <text x="4" y="118" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="20" letterSpacing="0.14em">
          <tspan fill="#E9ECF0">{word1}</tspan>
          <tspan fill={color} dx="6">{word2}</tspan>
        </text>
      )}
    </svg>
  );
}

export function GoogleMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Google logo">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}

interface PillProps {
  variant?: "brand" | "outline" | "ghost" | "stop" | "pass";
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  type?: "button" | "submit" | "reset";
  key?: React.Key;
}

export function Pill({ variant = "brand", children, className = "", style, disabled, onClick, type = "button", ...props }: PillProps) {
  let bg = "var(--brand)";
  let color = "#FFFFFF";
  let border = "none";

  if (variant === "outline") {
    bg = "transparent";
    color = "var(--chrome)";
    border = "1px solid var(--line)";
  } else if (variant === "ghost") {
    bg = "transparent";
    color = "var(--chrome-soft)";
    border = "none";
  } else if (variant === "stop") {
    bg = "var(--stop)";
    color = "#FFFFFF";
    border = "none";
  } else if (variant === "pass") {
    bg = "var(--pass)";
    color = "#000000";
    border = "none";
  }

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        backgroundColor: bg,
        color,
        border,
        borderRadius: "999px",
        padding: "8px 16px",
        fontFamily: "Archivo, sans-serif",
        fontWeight: 600,
        fontSize: "13px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, opacity 150ms ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Avatar({ initial, size = 32, ring = false }: { initial: string; size?: number; ring?: boolean }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "999px",
        backgroundColor: "var(--panel-2)",
        border: ring ? "2px solid var(--brand)" : "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Archivo, sans-serif",
        fontWeight: 700,
        fontSize: `${Math.round(size * 0.42)}px`,
        color: "var(--chrome)",
        flexShrink: 0,
      }}
    >
      {initial.toUpperCase()}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  height = "50dvh",
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  height?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        style={{
          width: "100%",
          maxHeight: height,
          minHeight: "200px",
          backgroundColor: "var(--panel)",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          borderTop: "1px solid var(--line)",
          padding: "16px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div style={{ width: "36px", height: "4px", backgroundColor: "var(--line)", borderRadius: "999px", alignSelf: "center" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {title ? <h2 style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: "18px", color: "var(--chrome)" }}>{title}</h2> : <div />}
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--chrome-soft)", cursor: "pointer", fontSize: "18px", padding: "4px" }}
            aria-label="Close sheet"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  width = "480px",
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: string;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: width,
          backgroundColor: "var(--panel)",
          borderRadius: "8px",
          border: "1px solid var(--line)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {title && <h2 style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: "18px", color: "var(--chrome)" }}>{title}</h2>}
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--chrome-soft)", cursor: "pointer", fontSize: "18px" }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: "44px",
        height: "26px",
        borderRadius: "999px",
        backgroundColor: on ? "var(--brand)" : "var(--line)",
        border: "none",
        padding: "2px",
        cursor: "pointer",
        position: "relative",
        transition: "background-color 160ms ease",
      }}
    >
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "999px",
          backgroundColor: "var(--chrome)",
          transform: on ? "translateX(18px)" : "translateX(0px)",
          transition: "transform 160ms ease",
        }}
      />
    </button>
  );
}

export function Toast({ message, tone = "brand", onClose }: { message: string; tone?: "brand" | "pass" | "stop"; onClose?: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  let borderLeftColor = "var(--brand)";
  if (tone === "pass") borderLeftColor = "var(--pass)";
  if (tone === "stop") borderLeftColor = "var(--stop)";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        backgroundColor: "var(--panel-2)",
        border: "1px solid var(--line)",
        borderLeft: `4px solid ${borderLeftColor}`,
        borderRadius: "6px",
        padding: "10px 16px",
        color: "var(--chrome)",
        fontFamily: "Archivo, sans-serif",
        fontSize: "13px",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}

export function StatCell({ label, value, tone }: { label: string; value: string | number; tone?: "brand" | "pass" | "warn" | "stop" }) {
  let valColor = "var(--chrome)";
  if (tone === "brand") valColor = "var(--brand)";
  if (tone === "pass") valColor = "var(--pass)";
  if (tone === "warn") valColor = "var(--warn)";
  if (tone === "stop") valColor = "var(--stop)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontFamily: "Archivo, sans-serif", fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: "18px", color: valColor }}>{value}</span>
    </div>
  );
}

// ==========================================
// SCREEN A: SIGN IN & ACCOUNT SETUP
// ==========================================

export function ScreenA({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<number>(1);
  const [accountSheet, setAccountSheet] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  // User form data
  const [chosenAccount, setChosenAccount] = useState({ name: "Balram Singh", email: "balram.singh@gmail.com" });
  const [name, setName] = useState("Balram Singh");
  const [username, setUsername] = useState("balram_singh");
  const [useCase, setUseCase] = useState<"read" | "report">("read");
  const [phone, setPhone] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Username validation check
  useEffect(() => {
    if (!username) return;
    setCheckingUsername(true);
    const timer = setTimeout(() => {
      setCheckingUsername(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [username]);

  const sanitizeUsername = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9_]/g, "");
  };

  const isUsernameTaken = username === "balram" || username === "admin";
  const isUsernameValid = username.length >= 4 && !isUsernameTaken && !checkingUsername;

  const handleSelectAccount = (acc: { name: string; email: string }) => {
    setLoadingAccount(true);
    setTimeout(() => {
      setLoadingAccount(false);
      setChosenAccount(acc);
      setName(acc.name);
      const localPart = acc.email.split("@")[0].replace(/\./g, "_");
      setUsername(localPart);
      setAccountSheet(false);
      setStep(3);
    }, 900);
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--void)", position: "relative" }}>
      {/* 4-segment progress bar */}
      {step >= 3 && (
        <div style={{ width: "100%", height: "3px", backgroundColor: "var(--line)" }}>
          <div
            style={{
              height: "100%",
              backgroundColor: "var(--brand)",
              width: `${((step - 2) / 3) * 100}%`,
              transition: "width 200ms ease",
            }}
          />
        </div>
      )}

      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
            <Logo height={72} />
            <h1 style={{ fontFamily: "Archivo, sans-serif", fontWeight: 700, fontSize: "24px", color: "var(--chrome)" }}>News from your district</h1>
            <p style={{ fontFamily: "Archivo, sans-serif", fontSize: "15px", color: "var(--chrome-soft)", lineHeight: 1.45 }}>
              Watch what's happening around you. Report what others are missing.
            </p>

            <div style={{ width: "100%", marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setAccountSheet(true)}
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: "999px",
                  backgroundColor: "#FFFFFF",
                  color: "#1F1F1F",
                  border: "none",
                  fontFamily: "Archivo, sans-serif",
                  fontWeight: 500,
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <GoogleMark size={20} />
                <span>Continue with Google</span>
              </button>

              <Pill variant="ghost" onClick={() => setStep(3)}>
                Browse without signing in
              </Pill>
            </div>

            <div style={{ marginTop: "24px", fontFamily: "Archivo, sans-serif", fontSize: "11px", color: "var(--chrome-soft)" }}>
              By continuing you agree to our{" "}
              <span style={{ color: "var(--chrome)", textDecoration: "underline" }}>Terms</span> and{" "}
              <span style={{ color: "var(--chrome)", textDecoration: "underline" }}>Privacy Policy</span>.
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Read-only account strip */}
            <div
              style={{
                backgroundColor: "var(--panel-2)",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <GoogleMark size={16} />
                <span style={{ fontFamily: "Archivo, sans-serif", fontSize: "13px", color: "var(--chrome)" }}>{chosenAccount.email}</span>
              </div>
              <button
                onClick={() => setAccountSheet(true)}
                style={{ background: "none", border: "none", color: "var(--brand)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
              >
                Change
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
              <Avatar initial={name.charAt(0) || "B"} size={72} ring />
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>Your name</label>
                <input
                  type="text"
                  maxLength={40}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "var(--panel-2)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0 12px",
                    color: "var(--chrome)",
                    fontFamily: "Archivo, sans-serif",
                    fontSize: "15px",
                  }}
                />
                <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>From your Google account. Change it if you want a different name shown.</span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>Username</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "12px", color: "var(--chrome-soft)" }}>@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                    style={{
                      width: "100%",
                      height: "44px",
                      backgroundColor: "var(--panel-2)",
                      border: "none",
                      borderRadius: "10px",
                      paddingLeft: "28px",
                      paddingRight: "12px",
                      color: "var(--chrome)",
                      fontFamily: "Archivo, sans-serif",
                      fontSize: "15px",
                    }}
                  />
                </div>
                <div style={{ marginTop: "4px", fontSize: "11px" }}>
                  {checkingUsername ? (
                    <span style={{ color: "var(--chrome-soft)" }}>Checking…</span>
                  ) : isUsernameTaken ? (
                    <span style={{ color: "var(--stop)" }}>Taken. Try another.</span>
                  ) : username.length >= 4 ? (
                    <span style={{ color: "var(--pass)" }}>Available</span>
                  ) : (
                    <span style={{ color: "var(--chrome-soft)" }}>Min 4 characters</span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>District</label>
                <div
                  style={{
                    backgroundColor: "var(--panel-2)",
                    borderRadius: "10px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>📍 Durgapur, West Bengal</span>
                  <button style={{ background: "none", border: "none", color: "var(--brand)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                    Change
                  </button>
                </div>
              </div>
            </div>

            <Pill variant="brand" disabled={name.length < 2 || !isUsernameValid} onClick={() => setStep(4)} style={{ marginTop: "16px", height: "48px" }}>
              Continue
            </Pill>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>How will you use G+ India News?</h2>
            <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>You can change this later.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                onClick={() => setUseCase("read")}
                style={{
                  backgroundColor: useCase === "read" ? "var(--panel-2)" : "var(--panel)",
                  border: useCase === "read" ? "2px solid var(--brand)" : "1px solid var(--line)",
                  borderRadius: "10px",
                  padding: "16px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "24px", color: "var(--chrome-soft)", marginBottom: "8px" }}>≡</div>
                <h3 style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>Read the news</h3>
                <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>Watch, comment, and follow reporters in your district.</p>
                <span style={{ fontSize: "11px", color: "var(--chrome-soft)", display: "block", marginTop: "6px" }}>Starts right away.</span>
              </div>

              <div
                onClick={() => setUseCase("report")}
                style={{
                  backgroundColor: useCase === "report" ? "var(--panel-2)" : "var(--panel)",
                  border: useCase === "report" ? "2px solid var(--brand)" : "1px solid var(--line)",
                  borderRadius: "10px",
                  padding: "16px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "24px", color: "var(--brand)", fontWeight: "bold", marginBottom: "8px" }}>+</div>
                <h3 style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>Report the news</h3>
                <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>
                  Post video from your area. Your district's moderator reviews your first few reports before they go live.
                </p>
                <span style={{ fontSize: "11px", color: "var(--chrome-soft)", display: "block", marginTop: "6px" }}>Needs a phone number and ID. Usually approved within 2 days.</span>
              </div>
            </div>

            {useCase === "report" && (
              <div style={{ backgroundColor: "var(--panel-2)", padding: "16px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <h4 style={{ fontSize: "13px", color: "var(--chrome)", fontWeight: 600 }}>You'll need</h4>
                <ul style={{ fontSize: "11px", color: "var(--chrome-soft)", paddingLeft: "16px", lineHeight: 1.6 }}>
                  <li>A phone number we can reach you on</li>
                  <li>Government or press ID</li>
                  <li>One sample video</li>
                </ul>

                <div style={{ marginTop: "8px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>Phone number</label>
                  <div style={{ display: "flex", alignItems: "center", height: "52px", backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "10px", padding: "0 12px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--chrome)" }}>+91</span>
                    <div style={{ width: "1px", height: "20px", backgroundColor: "var(--line)", margin: "0 12px" }} />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      style={{ border: "none", background: "none", color: "var(--chrome)", fontSize: "15px", width: "100%" }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Only your district moderator sees this. It is never shown on your profile.</span>
                </div>
              </div>
            )}

            <Pill
              variant="brand"
              disabled={useCase === "report" && phone.length < 10}
              onClick={() => setStep(5)}
              style={{ marginTop: "16px", height: "48px" }}
            >
              {useCase === "read" ? "Start watching" : "Apply to report"}
            </Pill>
          </div>
        )}

        {step === 5 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" }}>
            <Logo height={48} />
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "999px",
                backgroundColor: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>You're in!</h2>
            <p style={{ fontSize: "13px", color: "var(--chrome-soft)", lineHeight: 1.45 }}>
              {useCase === "read"
                ? "You'll see news from Durgapur. Follow a few reporters to shape your feed."
                : "Your application is with the Durgapur moderator. We'll notify you when it's reviewed. You can watch and comment in the meantime."}
            </p>

            <Pill variant="brand" onClick={onComplete} style={{ marginTop: "16px", width: "100%", height: "48px" }}>
              Open the feed
            </Pill>
          </div>
        )}
      </div>

      {/* Account Chooser Sheet */}
      <Sheet open={accountSheet} onClose={() => setAccountSheet(false)} height="52dvh" title="">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <GoogleMark size={18} />
            <div>
              <div style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>Choose an account</div>
              <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>to continue to G+ India News</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--panel-2)", borderRadius: "10px", border: "1px solid var(--line)" }}>
            {[
              { name: "Balram Singh", email: "balram.singh@gmail.com" },
              { name: "Balram S", email: "balram.work@gmail.com" },
            ].map((acc, idx) => (
              <div
                key={acc.email}
                onClick={() => handleSelectAccount(acc)}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  borderBottom: idx === 0 ? "1px solid var(--line)" : "none",
                }}
              >
                <Avatar initial={acc.name.charAt(0)} size={36} />
                <div>
                  <div style={{ fontSize: "13px", color: "var(--chrome)", fontWeight: 600 }}>{acc.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>{acc.email}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", color: "var(--chrome-soft)", fontSize: "13px" }}>
            <span>+</span>
            <span>Use another account</span>
          </div>

          {loadingAccount && <div style={{ color: "var(--brand)", fontSize: "13px", textAlign: "center" }}>Signing in...</div>}
        </div>
      </Sheet>
    </div>
  );
}

// ==========================================
// SCREEN B: MY ACCOUNT
// ==========================================

export function ScreenB({ onSelectTenant, onNavigate }: { onSelectTenant: (tenantId: string) => void; onNavigate?: (screen: "C" | "D") => void }) {
  const [role, setRole] = useState<"viewer" | "reporter" | "moderator" | "admin">("reporter");
  const [activeTab, setActiveTab] = useState<string>("Reports");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [expandedRejected, setExpandedRejected] = useState(false);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--void)", overflowY: "auto" }}>
      {/* Dev-only role switcher */}
      <div style={{ padding: "8px 16px", backgroundColor: "var(--panel-2)", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Preview as:</span>
        {(["viewer", "reporter", "moderator", "admin"] as const).map((r) => (
          <Pill key={r} variant={role === r ? "brand" : "outline"} onClick={() => setRole(r)} style={{ padding: "2px 8px", fontSize: "11px" }}>
            {r}
          </Pill>
        ))}
      </div>

      {/* Header */}
      <div style={{ backgroundColor: "var(--panel)", borderBottom: "1px solid var(--line)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "18px", color: "var(--chrome)", fontWeight: 700 }}>Account</h1>
          <button onClick={() => setSettingsOpen(true)} style={{ background: "none", border: "none", color: "var(--chrome)", cursor: "pointer" }}>
            ⚙
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} onClick={() => setSwitcherOpen(true)}>
          <Avatar initial="B" size={72} ring />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>Balram Singh</span>
              {role !== "viewer" && <span style={{ color: "var(--brand)" }}>✓</span>}
            </div>
            <div style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>@balram_durgapur</div>
            <div style={{ marginTop: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  border: role === "admin" ? "none" : "1px solid var(--line)",
                  backgroundColor: role === "admin" ? "var(--brand)" : "transparent",
                  color: role === "admin" ? "#FFFFFF" : role === "moderator" ? "var(--brand)" : "var(--chrome)",
                }}
              >
                {role === "viewer"
                  ? "Reader"
                  : role === "reporter"
                  ? "Reporter"
                  : role === "moderator"
                  ? "Moderator · Durgapur, Asansol"
                  : "Admin · G+ India News"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "var(--chrome-soft)", backgroundColor: "var(--panel-2)", padding: "4px 10px", borderRadius: "999px", alignSelf: "flex-start" }}>
          📍 Durgapur, West Bengal
        </div>

        {role !== "viewer" && (
          <p style={{ fontSize: "13px", color: "var(--chrome-soft)", lineHeight: 1.45 }}>
            Local news from Durgapur. Roads, power, water — whatever is happening in your neighbourhood, I show it.
          </p>
        )}

        <Pill variant="outline" style={{ width: "100%" }}>
          Edit profile
        </Pill>

        {/* Stats Row */}
        <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
          {role === "viewer" ? (
            <>
              <StatCell label="Following" value="48" />
              <StatCell label="Liked" value="126" />
              <StatCell label="Saved" value="9" />
            </>
          ) : (
            <>
              <StatCell label="Followers" value="12.4K" />
              <StatCell label="Reports" value="384" />
              <StatCell label="Views" value="2.1M" />
            </>
          )}
        </div>
      </div>

      {/* Role Panel */}
      <div style={{ padding: "16px" }}>
        <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {role === "viewer" && (
            <>
              <h3 style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>Become a reporter</h3>
              <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>Post video from your area. Your district's moderator reviews your first few reports before they go live.</p>
              <Pill variant="brand">Apply to report</Pill>
            </>
          )}

          {role === "reporter" && (
            <>
              <h3 style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>Your reports</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", backgroundColor: "var(--panel-2)", padding: "12px", borderRadius: "8px" }}>
                <StatCell label="Published" value="384" />
                <StatCell label="In review" value="3" />
                <StatCell label="Rejected" value="11" />
                <StatCell label="Approval rate" value="92%" />
              </div>
              <Pill variant="brand">+ Post news</Pill>
            </>
          )}

          {role === "moderator" && (
            <>
              <h3 style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>Review queue</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", backgroundColor: "var(--panel-2)", padding: "12px", borderRadius: "8px" }}>
                <StatCell label="Waiting" value="17" tone="brand" />
                <StatCell label="Flagged" value="4" />
                <StatCell label="Reviewed" value="128" />
              </div>
              <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Scope: Durgapur, Asansol</span>
              <Pill variant="brand" onClick={() => onNavigate?.("C")}>Open queue</Pill>
            </>
          )}

          {role === "admin" && (
            <>
              <h3 style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>G+ India News</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", backgroundColor: "var(--panel-2)", padding: "12px", borderRadius: "8px" }}>
                <StatCell label="Districts" value="6" />
                <StatCell label="Users" value="1,204" />
                <StatCell label="Pending" value="9" tone="brand" />
              </div>
              <Pill variant="brand" onClick={() => onNavigate?.("D")}>Open console</Pill>
              <Pill variant="outline">Manage reporters</Pill>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: "var(--panel)", borderBottom: "1px solid var(--line)", display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
        {(role === "viewer" ? ["Saved", "Liked", "Following"] : ["Reports", "Drafts", "Saved"]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              height: "44px",
              background: "none",
              border: "none",
              color: activeTab === tab ? "var(--chrome)" : "var(--chrome-soft)",
              fontFamily: "Archivo, sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              borderBottom: activeTab === tab ? "2px solid var(--brand)" : "none",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "12px" }}>
        {activeTab === "Reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
              {[
                { title: "Road caves in near Durgapur Steel Plant", views: "12.4K", bg: "#1B2A3D", status: "published" },
                { title: "Traders protest at Benachity market", views: "31.2K", bg: "#2E2340", status: "published" },
                { title: "সিটি সেন্টারে নতুন সরকারি হাসপাতাল ভবন", views: "8.1K", bg: "#10332C", status: "published" },
                { title: "Power cuts leave Muchipara residents stranded", views: "—", bg: "#3D1F1F", status: "in_review" },
                { title: "नगर निगम की सफाई गाड़ी दो हफ़्ते से बंद", views: "—", bg: "#23301F", status: "rejected" },
                { title: "Water level rises at Durgapur Barrage", views: "22.8K", bg: "#3A2E12", status: "published" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.status === "rejected" && setExpandedRejected(!expandedRejected)}
                  style={{
                    aspectRatio: "9/16",
                    backgroundColor: item.bg,
                    padding: "6px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    cursor: item.status === "rejected" ? "pointer" : "default",
                  }}
                >
                  {item.status === "in_review" && (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--chrome)", backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid var(--chrome)", padding: "2px 4px", borderRadius: "4px" }}>
                      IN REVIEW
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#FFFFFF", backgroundColor: "var(--stop)", padding: "2px 4px", borderRadius: "4px" }}>
                      REJECTED
                    </span>
                  )}
                  <div style={{ marginTop: "auto" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#E9ECF0", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>{item.title}</p>
                    <span style={{ fontSize: "11px", color: "#E9ECF0" }}>▶ {item.views}</span>
                  </div>
                </div>
              ))}
            </div>

            {expandedRejected && (
              <div style={{ backgroundColor: "var(--panel-2)", borderLeft: "2px solid var(--stop)", padding: "12px", borderRadius: "6px" }}>
                <h4 style={{ fontSize: "13px", color: "var(--chrome)", fontWeight: 600 }}>Why this was rejected</h4>
                <p style={{ fontSize: "11px", color: "var(--chrome-soft)", marginTop: "4px" }}>
                  Footage doesn't match the headline. Re-shoot showing the vehicle and the location board.
                </p>
                <span style={{ fontSize: "11px", color: "var(--chrome-soft)", display: "block", marginTop: "6px" }}>Reviewed by @moderator_dgp · 3 days ago</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "Drafts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", borderRadius: "8px", padding: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "56px", aspectRatio: "16/9", backgroundColor: "#1B2A3D", borderRadius: "4px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", color: "var(--chrome)", fontWeight: 600 }}>Untitled report 1</div>
                <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Saved 2 days ago</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Following" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {["Rita Mandal", "Suman Ghosh", "Amit Das", "Kavita Mahato"].map((person) => (
              <div key={person} style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Avatar initial={person.charAt(0)} size={40} />
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--chrome)", fontWeight: 600 }}>{person}</div>
                    <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Durgapur · 12.4K followers</div>
                  </div>
                </div>
                <Pill variant="outline" style={{ padding: "4px 12px", fontSize: "11px" }}>
                  Following
                </Pill>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} height="84dvh" title="Settings">
        {!deleteConfirm ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase" }}>Account</span>
              <div style={{ backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "8px", marginTop: "4px" }}>
                <div style={{ padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>Google account</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <GoogleMark size={16} />
                    <span style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>balram.singh@gmail.com</span>
                  </div>
                </div>
                <div style={{ padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>Username</span>
                  <span style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>@balram_durgapur</span>
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase" }}>Preferences</span>
              <div style={{ backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "8px", marginTop: "4px" }}>
                <div style={{ padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>Notifications</span>
                  <Toggle on={notifications} onChange={setNotifications} />
                </div>
                <div style={{ padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>Data saver</span>
                  <Toggle on={dataSaver} onChange={setDataSaver} />
                </div>
              </div>
            </div>

            <Pill variant="outline" onClick={() => setSettingsOpen(false)}>
              Sign out
            </Pill>
            <button onClick={() => setDeleteConfirm(true)} style={{ background: "none", border: "none", color: "var(--stop)", cursor: "pointer", fontSize: "13px" }}>
              Delete account
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "18px", color: "var(--chrome)", fontWeight: 700 }}>Delete your account?</h3>
            <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>Your reports, comments, and followers will be removed. This can't be undone.</p>
            <Pill variant="stop">Delete account</Pill>
            <Pill variant="outline" onClick={() => setDeleteConfirm(false)}>
              Keep my account
            </Pill>
          </div>
        )}
      </Sheet>

      {/* Account Switcher Sheet */}
      <Sheet open={switcherOpen} onClose={() => setSwitcherOpen(false)} height="40dvh" title="Switch account">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
            onClick={() => {
              onSelectTenant("gplus");
              setSwitcherOpen(false);
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Avatar initial="B" size={40} />
              <div>
                <div style={{ fontSize: "13px", color: "var(--chrome)", fontWeight: 600 }}>Balram Singh</div>
                <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>G+ India News · Reporter</div>
              </div>
            </div>
            <span style={{ color: "var(--brand)" }}>✓</span>
          </div>

          <div
            style={{ backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            onClick={() => {
              onSelectTenant("bangla-khabor");
              setSwitcherOpen(false);
            }}
          >
            <Avatar initial="B" size={40} />
            <div>
              <div style={{ fontSize: "13px", color: "var(--chrome)", fontWeight: 600 }}>Balram Singh</div>
              <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Bangla Khabor · Reader</div>
            </div>
          </div>

          <Pill variant="outline">+ Add account</Pill>
        </div>
      </Sheet>
    </div>
  );
}

// ==========================================
// SCREEN C: MODERATION QUEUE (DESKTOP)
// ==========================================

export function ScreenC() {
  const [districts, setDistricts] = useState<string[]>(["Durgapur", "Asansol"]);
  const [activeFilter, setActiveFilter] = useState("Waiting");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<{ msg: string; tone: "brand" | "pass" | "stop" } | null>(null);

  const [queue, setQueue] = useState([
    {
      id: "1",
      headline: "Road caves in near Durgapur Steel Plant, traffic held up",
      description: "Large cave-in on the approach road. Two-hour diversion in place.",
      handle: "@balram_durgapur",
      district: "Durgapur",
      time: "14m ago",
      duration: "0:48",
      flags: [],
      bg: "#1B2A3D",
    },
    {
      id: "2",
      headline: "সিটি সেন্টারে নতুন সরকারি হাসপাতাল ভবন",
      description: "নতুন ভবনটি আগামী মাসে চালু হওয়ার কথা।",
      handle: "@rita_m",
      district: "Durgapur",
      time: "38m ago",
      duration: "0:36",
      flags: ["NO AUDIO"],
      bg: "#2E2340",
    },
    {
      id: "3",
      headline: "Traders protest at Benachity market",
      description: "Shopkeepers gathered against the municipal corporation's new levy.",
      handle: "@dgp_desk",
      district: "Durgapur",
      time: "1h ago",
      duration: "1:02",
      flags: ["SIMILAR TO 3 OTHERS"],
      bg: "#10332C",
    },
    {
      id: "4",
      headline: "बांकुड़ा के गाँवों में पेयजल संकट",
      description: "गाँव वालों ने ब्लॉक ऑफिस के सामने प्रदर्शन किया।",
      handle: "@amit_das",
      district: "Asansol",
      time: "3h ago",
      duration: "0:55",
      flags: ["DUPLICATE", "SHAKY"],
      bg: "#3D1F1F",
    },
  ]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (rejectModalOpen) return;
      if (e.key === "j" || e.key === "J") {
        setFocusedIndex((prev) => Math.min(prev + 1, queue.length - 1));
      } else if (e.key === "k" || e.key === "K") {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "a" || e.key === "A") {
        if (queue[focusedIndex]) handleApprove(queue[focusedIndex].id);
      } else if (e.key === "r" || e.key === "R") {
        if (queue[focusedIndex]) setRejectModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [queue, focusedIndex, rejectModalOpen]);

  const handleApprove = (id: string) => {
    setQueue((q) => q.filter((i) => i.id !== id));
    setToast({ msg: "Approved", tone: "pass" });
  };

  const handleRejectConfirm = () => {
    if (!queue[focusedIndex]) return;
    setQueue((q) => q.filter((i) => i.id !== queue[focusedIndex].id));
    setRejectModalOpen(false);
    setToast({ msg: "Rejected", tone: "stop" });
  };

  const activeItem = queue[focusedIndex] || queue[0];

  const vw = useViewportWidth();
  const compact = vw < 900; // collapse the 3-column layout
  const isMobile = vw < 640;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--void)" }}>
      {/* Top Bar */}
      <div
        style={{
          minHeight: "56px",
          backgroundColor: "var(--panel)",
          borderBottom: "1px solid var(--line)",
          padding: compact ? "10px 12px" : "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: compact ? "wrap" : "nowrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Logo height={20} />
          <div style={{ width: "1px", height: "16px", backgroundColor: "var(--line)" }} />
          <span style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>Moderation</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {["Durgapur", "Asansol"].map((d) => (
            <Pill
              key={d}
              variant={districts.includes(d) ? "brand" : "outline"}
              onClick={() => setDistricts((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
              style={{ padding: "4px 12px", fontSize: "11px" }}
            >
              {d}
            </Pill>
          ))}
          <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Your scope · set by admin</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span>🔔</span>
          <Avatar initial="M" size={32} />
          {!isMobile && <span style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>@moderator_dgp</span>}
        </div>
      </div>

      {/* Main 3 Column Layout */}
      <div style={{ flex: 1, display: "flex", flexDirection: compact ? "column" : "row", overflow: compact ? "auto" : "hidden" }}>
        {/* Left Column (300px) */}
        <div
          style={{
            width: compact ? "100%" : "300px",
            flex: "none",
            backgroundColor: "var(--panel)",
            borderRight: compact ? "none" : "1px solid var(--line)",
            borderBottom: compact ? "1px solid var(--line)" : "none",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Queue</span>

          <div style={{ display: "flex", flexDirection: compact ? "row" : "column", gap: compact ? "8px" : "4px", overflowX: compact ? "auto" : "visible" }}>
            {[
              { label: "Waiting", count: queue.length, tone: "brand" },
              { label: "Flagged", count: 3, tone: "warn" },
              { label: "Approved today", count: 23, tone: "soft" },
              { label: "Rejected today", count: 6, tone: "soft" },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setActiveFilter(f.label)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  flex: "none",
                  whiteSpace: "nowrap",
                  padding: "10px 12px",
                  backgroundColor: activeFilter === f.label ? "var(--panel-2)" : "transparent",
                  borderLeft: activeFilter === f.label ? "2px solid var(--brand)" : "none",
                  border: "none",
                  color: "var(--chrome)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <span>{f.label}</span>
                <span style={{ fontWeight: 700, color: f.tone === "brand" ? "var(--brand)" : f.tone === "warn" ? "var(--warn)" : "var(--chrome-soft)" }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Column */}
        <div style={{ flex: compact ? "none" : 1, padding: compact ? "12px" : "20px", overflowY: compact ? "visible" : "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "18px", color: "var(--chrome)", fontWeight: 700 }}>{queue.length} waiting</h2>
            {!isMobile && (
              <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>J / K to move · A to approve · R to reject · Esc to close</span>
            )}
          </div>

          {queue.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", gap: "12px" }}>
              <Logo height={40} />
              <h3 style={{ fontSize: "18px", color: "var(--chrome)" }}>Queue clear</h3>
              <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>Nothing waiting in Durgapur or Asansol right now.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setFocusedIndex(index)}
                  style={{
                    backgroundColor: "var(--panel)",
                    border: focusedIndex === index ? "2px solid var(--brand)" : "1px solid var(--line)",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    flexWrap: isMobile ? "wrap" : "nowrap",
                    gap: "16px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() =>
                      setSelectedItems((prev) => (prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]))
                    }
                  />

                  <div style={{ width: "96px", aspectRatio: "9/16", backgroundColor: item.bg, borderRadius: "4px", position: "relative", flexShrink: 0 }}>
                    <span style={{ position: "absolute", bottom: "4px", right: "4px", fontSize: "11px", color: "#E9ECF0", backgroundColor: "rgba(0,0,0,0.6)", padding: "2px 4px", borderRadius: "4px" }}>
                      {item.duration}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: isMobile ? "55%" : "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <h3 style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 600 }}>{item.headline}</h3>
                    <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>{item.description}</p>
                    <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>
                      {item.handle} · {item.district} · {item.time}
                    </span>

                    {item.flags.length > 0 && (
                      <div style={{ display: "flex", gap: "6px" }}>
                        {item.flags.map((flag) => (
                          <span key={flag} style={{ fontSize: "11px", fontWeight: 700, color: "var(--warn)", border: "1px solid var(--warn)", padding: "2px 6px", borderRadius: "4px" }}>
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ width: isMobile ? "100%" : "140px", display: "flex", flexDirection: isMobile ? "row" : "column", gap: "6px" }}>
                    <Pill variant="pass" onClick={() => handleApprove(item.id)} style={{ flex: isMobile ? 1 : undefined }}>
                      Approve
                    </Pill>
                    <Pill variant="stop" onClick={() => setRejectModalOpen(true)} style={{ flex: isMobile ? 1 : undefined }}>
                      Reject
                    </Pill>
                    <Pill variant="outline" style={{ flex: isMobile ? 1 : undefined }}>Escalate</Pill>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bulk Bar */}
          {selectedItems.length > 0 && (
            <div style={{ backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--chrome)" }}>{selectedItems.length} selected</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <Pill variant="pass">Approve selected</Pill>
                <Pill variant="stop">Reject selected</Pill>
                <Pill variant="ghost" onClick={() => setSelectedItems([])}>
                  Clear
                </Pill>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (320px): Reporter Details */}
        <div
          style={{
            width: compact ? "100%" : "320px",
            flex: "none",
            backgroundColor: "var(--panel)",
            borderLeft: compact ? "none" : "1px solid var(--line)",
            borderTop: compact ? "1px solid var(--line)" : "none",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--chrome-soft)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Reporter</span>

          {activeItem && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar initial="B" size={48} ring />
                <div>
                  <div style={{ fontSize: "15px", color: "var(--chrome)", fontWeight: 700 }}>Balram Singh</div>
                  <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>{activeItem.handle}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Trust score</span>
                <div style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>82%</div>
                <div style={{ width: "100%", height: "6px", backgroundColor: "var(--line)", borderRadius: "999px", marginTop: "4px" }}>
                  <div style={{ width: "82%", height: "100%", backgroundColor: "var(--pass)", borderRadius: "999px" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Approved</span>
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>384</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>Rejected</span>
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>11</span>
                </div>
              </div>

              <Pill variant="outline">View all reports</Pill>
              <Pill variant="stop">Suspend reporter</Pill>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject this report">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            "Footage doesn't match the headline",
            "Can't verify this happened",
            "Shows faces or private details without consent",
            "Duplicate of an existing report",
            "Unusable quality — too shaky or no audio",
            "Breaks community rules",
          ].map((reason) => (
            <div
              key={reason}
              onClick={() => setRejectReason(reason)}
              style={{
                backgroundColor: "var(--panel-2)",
                border: rejectReason === reason ? "2px solid var(--brand)" : "1px solid var(--line)",
                borderRadius: "8px",
                padding: "10px",
                cursor: "pointer",
                fontSize: "13px",
                color: "var(--chrome)",
              }}
            >
              {reason}
            </div>
          ))}

          <textarea
            placeholder="Note to reporter (optional)"
            style={{ backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "8px", color: "var(--chrome)", fontSize: "13px" }}
          />

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
            <Pill variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Pill>
            <Pill variant="stop" disabled={!rejectReason} onClick={handleRejectConfirm}>
              Reject report
            </Pill>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}

// ==========================================
// SCREEN D: ADMIN CONSOLE (MULTI-TENANT DESKTOP)
// ==========================================

export function ScreenD({
  activeTenant,
  onSelectTenant,
  adPlacements,
  onChangeAdPlacements,
}: {
  activeTenant: string;
  onSelectTenant: (id: string) => void;
  adPlacements?: AdPlacements;
  onChangeAdPlacements?: (p: AdPlacements) => void;
}) {
  const ads = adPlacements ?? DEFAULT_AD_PLACEMENTS;
  const setAds = (patch: Partial<AdPlacements>) => onChangeAdPlacements?.({ ...ads, ...patch });
  const [nav, setNav] = useState("Overview");
  const [tenantDropdown, setTenantDropdown] = useState(false);
  const [categories, setCategories] = useState<{ id: string; label: string; emoji: string; color: string }[]>([
    { id: "civic", label: "Civic", emoji: "🏛️", color: "#0EA5E9" },
    { id: "crime", label: "Crime", emoji: "🚨", color: "#DC2626" },
    { id: "politics", label: "Politics", emoji: "🗳️", color: "#B45309" },
    { id: "sport", label: "Sport", emoji: "🏏", color: "#16A34A" },
    { id: "weather", label: "Weather", emoji: "⛅", color: "#CA8A04" },
  ]);
  const [newCat, setNewCat] = useState({ label: "", emoji: "🗂️", color: "#E01B22" });
  const [brandColor, setBrandColor] = useState(
    activeTenant === "bangla-khabor" ? "#0F7B5A" : activeTenant === "purvanchal" ? "#B45309" : "#E01B22"
  );

  useEffect(() => {
    if (activeTenant === "bangla-khabor") setBrandColor("#0F7B5A");
    else if (activeTenant === "purvanchal") setBrandColor("#B45309");
    else setBrandColor("#E01B22");
  }, [activeTenant]);

  const handleColorChange = (col: string) => {
    setBrandColor(col);
    document.documentElement.style.setProperty("--brand", col);
  };

  const vw = useViewportWidth();
  const compact = vw < 768; // stack nav above content on smaller screens

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "var(--void)" }}>
      {/* Top Bar */}
      <div style={{ height: "56px", backgroundColor: "var(--panel)", borderBottom: "1px solid var(--line)", padding: compact ? "0 12px" : "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setTenantDropdown(!tenantDropdown)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <TenantLogo tenantId={activeTenant} height={20} />
            <span style={{ color: "var(--chrome-soft)" }}>▼</span>
          </button>

          {tenantDropdown && (
            <div style={{ position: "absolute", top: "40px", left: 0, width: "280px", backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "8px", zIndex: 100 }}>
              {[
                { id: "gplus", name: "G+ India News", col: "#E01B22" },
                { id: "bangla-khabor", name: "Bangla Khabor", col: "#0F7B5A" },
                { id: "purvanchal", name: "Purvanchal Live", col: "#B45309" },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTenant(t.id);
                    setTenantDropdown(false);
                  }}
                  style={{ padding: "8px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                >
                  <div style={{ width: "28px", height: "28px", backgroundColor: t.col, borderRadius: "4px" }} />
                  <span style={{ fontSize: "13px", color: "var(--chrome)" }}>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar initial="S" size={32} />
          <span style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>@superadmin</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, display: "flex", flexDirection: compact ? "column" : "row", overflow: compact ? "auto" : "hidden" }}>
        {/* Left Nav (240px) */}
        <div
          style={{
            width: compact ? "100%" : "240px",
            flex: "none",
            backgroundColor: "var(--panel)",
            borderRight: compact ? "none" : "1px solid var(--line)",
            borderBottom: compact ? "1px solid var(--line)" : "none",
            padding: compact ? "8px" : "16px 0",
            display: "flex",
            flexDirection: compact ? "row" : "column",
            overflowX: compact ? "auto" : "visible",
          }}
        >
          {["Overview", "Districts", "Users", "Categories", "Ad placements", "Reporter approvals", "Moderators", "Content", "Branding", "Settings"].map((item) => (
            <button
              key={item}
              onClick={() => setNav(item)}
              style={{
                padding: compact ? "10px 14px" : "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: compact ? "center" : "space-between",
                gap: "6px",
                flex: "none",
                whiteSpace: "nowrap",
                backgroundColor: nav === item ? "var(--panel-2)" : "transparent",
                border: "none",
                borderLeft: !compact && nav === item ? "2px solid var(--brand)" : undefined,
                borderBottom: compact && nav === item ? "2px solid var(--brand)" : undefined,
                color: nav === item ? "var(--chrome)" : "var(--chrome-soft)",
                fontSize: "13px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>{item}</span>
              {item === "Reporter approvals" && (
                <span style={{ backgroundColor: "var(--brand)", color: "#FFF", fontSize: "11px", borderRadius: "999px", padding: "2px 6px" }}>9</span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ flex: compact ? "none" : 1, padding: compact ? "16px" : "24px", overflowY: compact ? "visible" : "auto" }}>
          {nav === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h1 style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>
                {activeTenant === "bangla-khabor" ? "Bangla Khabor" : activeTenant === "purvanchal" ? "Purvanchal Live" : "G+ India News"}
              </h1>

              <div style={{ display: "grid", gridTemplateColumns: compact ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "16px" }}>
                <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "16px", borderRadius: "8px" }}>
                  <StatCell label="Reports published" value="2,847" />
                  <span style={{ fontSize: "11px", color: "var(--pass)" }}>+12%</span>
                </div>
                <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "16px", borderRadius: "8px" }}>
                  <StatCell label="Active reporters" value="184" />
                  <span style={{ fontSize: "11px", color: "var(--pass)" }}>+8%</span>
                </div>
                <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "16px", borderRadius: "8px" }}>
                  <StatCell label="Total views" value="4.2M" />
                  <span style={{ fontSize: "11px", color: "var(--pass)" }}>+21%</span>
                </div>
                <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "16px", borderRadius: "8px" }}>
                  <StatCell label="Avg review time" value="24m" />
                  <span style={{ fontSize: "11px", color: "var(--pass)" }}>-6% faster</span>
                </div>
              </div>
            </div>
          )}

          {nav === "Users" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>Users</h2>
              <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "480px", borderCollapse: "collapse", color: "var(--chrome)", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--line)", textTransform: "uppercase", fontSize: "11px", color: "var(--chrome-soft)" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>User</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Role</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Trust</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Balram Singh", handle: "@balram_durgapur", role: "Reporter", trust: 82 },
                    { name: "Rita Mandal", handle: "@rita_m", role: "Reporter", trust: 74 },
                    { name: "Priya Sen", handle: "@priya_mod", role: "Moderator", trust: 95 },
                  ].map((u) => (
                    <tr key={u.handle} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px" }}>
                        <div>{u.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>{u.handle}</div>
                      </td>
                      <td style={{ padding: "12px" }}>{u.role}</td>
                      <td style={{ padding: "12px" }}>{u.trust}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {nav === "Branding" && (
            <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: "24px" }}>
              <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "20px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "18px", color: "var(--chrome)" }}>Brand Settings</h3>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>Brand colour</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    {["#E01B22", "#0F7B5A", "#B45309", "#1D4ED8", "#7C3AED", "#BE185D"].map((c) => (
                      <div
                        key={c}
                        onClick={() => handleColorChange(c)}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "4px",
                          backgroundColor: c,
                          cursor: "pointer",
                          border: brandColor === c ? "2px solid #FFF" : "none",
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    style={{ backgroundColor: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "6px", padding: "8px", color: "var(--chrome)" }}
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "20px", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h3 style={{ fontSize: "18px", color: "var(--chrome)", marginBottom: "16px" }}>Preview</h3>
                <div style={{ width: "240px", aspectRatio: "9/16", backgroundColor: "var(--void)", border: "1px solid var(--line)", borderRadius: "12px", padding: "12px" }}>
                  <TenantLogo tenantId={activeTenant} height={20} />
                  <div style={{ marginTop: "20px", backgroundColor: "var(--brand)", color: "#FFF", padding: "4px", fontSize: "11px", borderRadius: "4px" }}>
                    Live Accent Color Test
                  </div>
                </div>
              </div>
            </div>
          )}

          {nav === "Categories" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px" }}>
              <h2 style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>Categories</h2>
              <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>
                Categories reporters can file under, and readers can browse. Add your own for this tenant.
              </p>

              {/* Add form */}
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "16px", display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ width: "64px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>Icon</label>
                  <input
                    value={newCat.emoji}
                    onChange={(e) => setNewCat({ ...newCat, emoji: e.target.value.slice(0, 2) })}
                    style={{ width: "100%", height: "40px", textAlign: "center", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--chrome)", fontSize: "18px" }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>Category name</label>
                  <input
                    value={newCat.label}
                    onChange={(e) => setNewCat({ ...newCat, label: e.target.value })}
                    placeholder="e.g. Health"
                    style={{ width: "100%", height: "40px", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "8px", padding: "0 12px", color: "var(--chrome)", fontSize: "14px" }}
                  />
                </div>
                <div style={{ width: "56px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--chrome-soft)", marginBottom: "4px" }}>Colour</label>
                  <input
                    type="color"
                    value={newCat.color}
                    onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                    style={{ width: "100%", height: "40px", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: "8px", cursor: "pointer" }}
                  />
                </div>
                <Pill
                  variant="brand"
                  disabled={newCat.label.trim().length < 2}
                  onClick={() => {
                    const id = newCat.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    if (!id || categories.some((c) => c.id === id)) return;
                    setCategories([...categories, { id, label: newCat.label.trim(), emoji: newCat.emoji || "🗂️", color: newCat.color }]);
                    setNewCat({ label: "", emoji: "🗂️", color: "#E01B22" });
                  }}
                  style={{ height: "40px" }}
                >
                  + Add category
                </Pill>
              </div>

              {/* List */}
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px" }}>
                {categories.map((c, i) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < categories.length - 1 ? "1px solid var(--line)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{c.emoji}</div>
                      <div>
                        <div style={{ fontSize: "14px", color: "var(--chrome)", fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>#{c.id}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCategories(categories.filter((x) => x.id !== c.id))}
                      style={{ background: "none", border: "1px solid var(--line)", color: "var(--stop)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nav === "Ad placements" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px" }}>
              <h2 style={{ fontSize: "24px", color: "var(--chrome)", fontWeight: 700 }}>Ad placements</h2>
              <p style={{ fontSize: "13px", color: "var(--chrome-soft)" }}>
                Choose where advertiser ads appear across the site. Sponsored cards are drawn from approved ads that match each slot's district and category.
              </p>

              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px" }}>
                {([
                  { key: "homeSponsored", label: "Sponsored cards on Home", desc: "Insert sponsored cards into home feed sections." },
                  { key: "districtPages", label: "Sponsored cards on District / Category pages", desc: "Show sponsored cards on region and topic pages." },
                  { key: "videoDetail", label: "Sponsored card on Video page", desc: "A 'You might like' sponsored card under each video." },
                  { key: "inFeed", label: "In-feed video ads (mobile)", desc: "Full-screen sponsored video every few clips in the mobile feed." },
                  { key: "banner", label: "Banner between sections", desc: "A banner strip between home sections." },
                ] as { key: keyof AdPlacements; label: string; desc: string }[]).map((row, i, arr) => (
                  <div key={row.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none" }}>
                    <div>
                      <div style={{ fontSize: "14px", color: "var(--chrome)", fontWeight: 600 }}>{row.label}</div>
                      <div style={{ fontSize: "11px", color: "var(--chrome-soft)", marginTop: "2px" }}>{row.desc}</div>
                    </div>
                    <Toggle on={Boolean(ads[row.key])} onChange={(v) => setAds({ [row.key]: v } as Partial<AdPlacements>)} />
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: "10px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "var(--chrome)", fontWeight: 600 }}>Ad frequency</div>
                  <div style={{ fontSize: "11px", color: "var(--chrome-soft)", marginTop: "2px" }}>Show one sponsored card after every N videos.</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button onClick={() => setAds({ frequency: Math.max(3, ads.frequency - 1) })} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", color: "var(--chrome)", cursor: "pointer", fontSize: "16px" }}>−</button>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--chrome)", minWidth: "28px", textAlign: "center" }}>{ads.frequency}</span>
                  <button onClick={() => setAds({ frequency: Math.min(12, ads.frequency + 1) })} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--line)", background: "transparent", color: "var(--chrome)", cursor: "pointer", fontSize: "16px" }}>+</button>
                </div>
              </div>

              <p style={{ fontSize: "11px", color: "var(--chrome-soft)" }}>
                Changes preview live on the Home portal. In production they persist per tenant via <code>updateAdPlacements</code>.
              </p>
            </div>
          )}

          {nav !== "Overview" && nav !== "Users" && nav !== "Branding" && nav !== "Categories" && nav !== "Ad placements" && (
            <div style={{ backgroundColor: "var(--panel)", border: "1px solid var(--line)", padding: "30px", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", color: "var(--chrome)" }}>Not built yet</h3>
              <p style={{ fontSize: "13px", color: "var(--chrome-soft)", marginTop: "4px" }}>This section is part of the next milestone.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP ENTRY WITH SHELL
// ==========================================

export default function App() {
  const [screen, setScreen] = useState<"HOME" | "A" | "B" | "C" | "D" | "E">("HOME");
  const [tenant, setTenant] = useState<string>("gplus");
  const [adPlacements, setAdPlacements] = useState<AdPlacements>(DEFAULT_AD_PLACEMENTS);
  const vw = useViewportWidth();
  const isDesktop = vw >= 768;

  useEffect(() => {
    let col = "#E01B22";
    if (tenant === "bangla-khabor") col = "#0F7B5A";
    if (tenant === "purvanchal") col = "#B45309";
    document.documentElement.style.setProperty("--brand", col);
  }, [tenant]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#E9ECF0",
        fontFamily: "'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;600&family=Anek+Devanagari:wght@400;600;700&family=Archivo:wght@400;500;600;700;800&display=swap');

        :root {
          --void: #000000;
          --panel: #0E1013;
          --panel-2: #171A1F;
          --line: #262A31;
          --chrome: #E9ECF0;
          --chrome-soft: #9AA1AB;
          --brand: #E01B22;
          --stop: #E01B22;
          --pass: #4ADE80;
          --warn: #FBBF24;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        [tabindex]:focus-visible {
          outline: 2px solid var(--brand) !important;
          outline-offset: 2px !important;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Floating home control on the app/console screens — the public site
          leads with the portal, so there is no dev bar. */}
      {screen !== "HOME" && (
        <button
          onClick={() => setScreen("HOME")}
          style={{
            position: "fixed",
            top: "14px",
            left: "14px",
            zIndex: 9999,
            height: "34px",
            padding: "0 14px",
            borderRadius: "999px",
            border: "none",
            background: "var(--brand)",
            color: "#fff",
            fontFamily: "Archivo, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          ‹ Home
        </button>
      )}

      {/* Active Screen Container */}
      <div style={{ height: "100vh", overflow: "hidden" }}>
        {/* HOME — the public web portal (SEO surface), scrolls on its own */}
        {screen === "HOME" && (
          <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
            <Portal onNavigate={setScreen} adPlacements={adPlacements} />
          </div>
        )}

        {/* App Screens A & B — phone-framed on desktop, full-bleed on mobile */}
        {(screen === "A" || screen === "B") && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: isDesktop ? "center" : "stretch",
              backgroundColor: "var(--panel)",
              padding: isDesktop ? "24px" : "0",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "430px",
                height: isDesktop ? "min(880px, 100%)" : "100%",
                backgroundColor: "var(--void)",
                borderRadius: isDesktop ? "24px" : "0",
                border: isDesktop ? "1px solid var(--line)" : "none",
                boxShadow: isDesktop ? "0 24px 60px rgba(0,0,0,0.5)" : "none",
                overflow: "hidden",
              }}
            >
              {screen === "A" && <ScreenA onComplete={() => setScreen("B")} />}
              {screen === "B" && <ScreenB onSelectTenant={setTenant} onNavigate={setScreen} />}
            </div>
          </div>
        )}

        {/* Console Screens C, D & E — responsive multi-column that stacks on mobile */}
        {(screen === "C" || screen === "D" || screen === "E") && (
          <div style={{ width: "100%", height: "100%" }}>
            {screen === "C" && <ScreenC />}
            {screen === "D" && <ScreenD activeTenant={tenant} onSelectTenant={setTenant} adPlacements={adPlacements} onChangeAdPlacements={setAdPlacements} />}
            {screen === "E" && <Advertiser />}
          </div>
        )}
      </div>
    </div>
  );
}
