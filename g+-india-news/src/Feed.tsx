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

// Data Models
export interface CommentItem {
  id: string;
  name: string;
  text: string;
  time: string;
  likes: number;
}

export interface NewsVideo {
  id: string;
  districtKey: string; // 'durgapur' | 'asansol' | 'bankura' | 'purulia' | 'bardhaman' | 'kolkata' | 'west-bengal' | 'india'
  districtName: string;
  headline: string;
  creator: string;
  verified: boolean;
  live: boolean;
  likes: number;
  commentsCount: number;
  views: string;
  time: string;
  tags: string[];
  streamUrl: string;
  posterBg: string;
  commentsList: CommentItem[];
}

const DISTRICT_CHIPS = [
  { key: "durgapur", label: "Durgapur", isOwn: true, scope: "district" },
  { key: "asansol", label: "Asansol", isOwn: false, scope: "district" },
  { key: "bankura", label: "Bankura", isOwn: false, scope: "district" },
  { key: "purulia", label: "Purulia", isOwn: false, scope: "district" },
  { key: "bardhaman", label: "Bardhaman", isOwn: false, scope: "district" },
  { key: "kolkata", label: "Kolkata", isOwn: false, scope: "district" },
  { key: "west-bengal", label: "West Bengal", isOwn: false, scope: "state" },
  { key: "india", label: "India", isOwn: false, scope: "national" },
];

const STREAM_A = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const STREAM_B = "https://test-streams.mux.dev/pts_shift/master.m3u8";
const STREAM_C = "https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8";

const INITIAL_NEWS_ITEMS: NewsVideo[] = [
  {
    id: "1",
    districtKey: "durgapur",
    districtName: "Durgapur",
    headline: "Road caves in near Durgapur Steel Plant, traffic held up for two hours",
    creator: "Balram Singh",
    verified: true,
    live: false,
    likes: 1240,
    commentsCount: 86,
    views: "12.4K",
    time: "2h ago",
    tags: ["roads", "durgapur", "traffic"],
    streamUrl: STREAM_A,
    posterBg: "#1a1212",
    commentsList: [
      { id: "c1", name: "Animesh Roy", text: "This place has needed repair for months!", time: "1h ago", likes: 14 },
      { id: "c2", name: "Pooja Sharma", text: "Traffic diverted via B-Zone now.", time: "45m ago", likes: 6 },
    ],
  },
  {
    id: "2",
    districtKey: "durgapur",
    districtName: "Durgapur",
    headline: "সিটি সেন্টারে নতুন সরকারি হাসপাতাল ভবন, চালু হবে পরের মাসে",
    creator: "Rita Mandal",
    verified: false,
    live: false,
    likes: 892,
    commentsCount: 44,
    views: "8.1K",
    time: "4h ago",
    tags: ["health", "durgapur"],
    streamUrl: STREAM_B,
    posterBg: "#121a18",
    commentsList: [
      { id: "c3", name: "Sourav Paul", text: "খুব ভালো উদ্যোগ!", time: "3h ago", likes: 21 },
    ],
  },
  {
    id: "3",
    districtKey: "durgapur",
    districtName: "Durgapur",
    headline: "Traders protest at Benachity market against municipal corporation",
    creator: "G+ Durgapur",
    verified: true,
    live: true,
    likes: 2310,
    commentsCount: 197,
    views: "31.2K",
    time: "Now",
    tags: ["protest", "traders", "durgapur"],
    streamUrl: STREAM_C,
    posterBg: "#1e140d",
    commentsList: [
      { id: "c4", name: "Deepak Kumar", text: "Live reporting on point. Thanks G+", time: "10m ago", likes: 35 },
    ],
  },
  {
    id: "4",
    districtKey: "asansol",
    districtName: "Asansol",
    headline: "New foot overbridge at Asansol railway station opens to passengers",
    creator: "Suman Ghosh",
    verified: true,
    live: false,
    likes: 654,
    commentsCount: 31,
    views: "5.9K",
    time: "6h ago",
    tags: ["railway", "asansol"],
    streamUrl: STREAM_A,
    posterBg: "#141520",
    commentsList: [
      { id: "c5", name: "Aritra Basu", text: "Much safer platform crossing now.", time: "5h ago", likes: 8 },
    ],
  },
  {
    id: "5",
    districtKey: "bankura",
    districtName: "Bankura",
    headline: "बांकुड़ा के गाँवों में पेयजल संकट, ग्रामीणों ने किया प्रदर्शन",
    creator: "Amit Das",
    verified: false,
    live: false,
    likes: 1103,
    commentsCount: 73,
    views: "9.7K",
    time: "8h ago",
    tags: ["water", "bankura", "rural"],
    streamUrl: STREAM_B,
    posterBg: "#1f1812",
    commentsList: [
      { id: "c6", name: "Vikram Singh", text: "पानी की समस्या का समाधान जल्दी होना चाहिए।", time: "6h ago", likes: 19 },
    ],
  },
  {
    id: "6",
    districtKey: "purulia",
    districtName: "Purulia",
    headline: "Farmers' fair in Purulia draws growers from 40 villages",
    creator: "Kavita Mahato",
    verified: false,
    live: false,
    likes: 421,
    commentsCount: 19,
    views: "3.4K",
    time: "Yesterday",
    tags: ["farming", "purulia"],
    streamUrl: STREAM_C,
    posterBg: "#121a12",
    commentsList: [
      { id: "c7", name: "Suresh Hansda", text: "Organic seeds stalls were great.", time: "1d ago", likes: 5 },
    ],
  },
];

/**
 * Individual Video Player Slide component handling HLS playback & video controls
 */
interface VideoSlideProps {
  item: NewsVideo;
  isActive: boolean;
  isGlobalMuted: boolean;
  isSheetOpen: boolean;
  onToggleGlobalMuted: () => void;
  onLikeToggle: (id: string) => void;
  isLiked: boolean;
  likeCount: number;
  onOpenComments: (item: NewsVideo) => void;
  onOpenMore: (item: NewsVideo) => void;
  isFollowing: boolean;
  onToggleFollow: (creator: string) => void;
  onPostNews: () => void;
}

function VideoSlide({
  item,
  isActive,
  isGlobalMuted,
  isSheetOpen,
  onToggleGlobalMuted,
  onLikeToggle,
  isLiked,
  likeCount,
  onOpenComments,
  onOpenMore,
  isFollowing,
  onToggleFollow,
  onPostNews,
}: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tapFeedback, setTapFeedback] = useState<"play" | "pause" | null>(null);
  const [likePopping, setLikePopping] = useState(false);

  const feedbackTimerRef = useRef<number | null>(null);

  // Initialize HLS
  useEffect(() => {
    let hlsInstance: any = null;
    let isMounted = true;
    const video = videoRef.current;

    if (!video) return;

    async function loadHlsStream() {
      try {
        // Dynamic import from CDN as required
        // @ts-ignore
        const HlsModule = await import("https://esm.sh/hls.js@1.5.13");
        const HlsClass = HlsModule.default || HlsModule;

        if (!isMounted) return;

        if (HlsClass.isSupported()) {
          hlsInstance = new HlsClass({
            enableWorker: false,
            autoStartLoad: true,
          });
          hlsInstance.loadSource(item.streamUrl);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = item.streamUrl;
        }
      } catch (err) {
        // Fallback for native Safari or blocked CDN
        if (video) {
          video.src = item.streamUrl;
        }
      }
    }

    loadHlsStream();

    return () => {
      isMounted = false;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [item.streamUrl]);

  // Handle Play / Pause based on active state and open sheets
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !isSheetOpen) {
      video.muted = isGlobalMuted;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay policy might force muted
          video.muted = true;
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, isSheetOpen, isGlobalMuted]);

  // Keep muted state synced
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  const handleVideoTap = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      showFeedback("play");
    } else {
      video.pause();
      setIsPlaying(false);
      showFeedback("pause");
    }
  };

  const showFeedback = (type: "play" | "pause") => {
    setTapFeedback(type);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setTapFeedback(null);
    }, 500);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleLike = () => {
    setLikePopping(true);
    setTimeout(() => setLikePopping(false), 150);
    onLikeToggle(item.id);
  };

  const avatarInitial = item.creator ? item.creator.charAt(0).toUpperCase() : "G";

  return (
    <div className="video-slide" style={{ backgroundColor: item.posterBg }}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="video-element"
        playsInline
        muted={isGlobalMuted}
        loop
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onClick={handleVideoTap}
      />

      {/* Loading Indeterminate Bar */}
      {isLoading && <div className="loading-top-bar" />}

      {/* Tap Feedback Overlay (Play/Pause flash) */}
      {tapFeedback && (
        <div className="tap-feedback-overlay">
          {tapFeedback === "play" ? (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--chrome)">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--chrome)">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </div>
      )}

      {/* Watermark & Mute Controls (Top Right below top bar) */}
      <div className="watermark-container">
        <div className="watermark-logo">
          <Logo height={14} />
        </div>
        <button
          type="button"
          className="mute-btn"
          onClick={onToggleGlobalMuted}
          aria-label={isGlobalMuted ? "Unmute video" : "Mute video"}
        >
          {isGlobalMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>

      {/* Bottom Scrim (Single Gradient allowed) */}
      <div className="bottom-scrim" />

      {/* Bottom Overlay Content */}
      <div className="bottom-overlay">
        {/* LIVE Badge */}
        {item.live && (
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
        )}

        {/* Creator Row */}
        <div className="creator-row">
          <div className="creator-avatar">{avatarInitial}</div>
          <span className="creator-name">{item.creator}</span>
          {item.verified && (
            <span className="verified-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
          <button
            type="button"
            className={`follow-pill ${isFollowing ? "following" : ""}`}
            onClick={() => onToggleFollow(item.creator)}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Headline */}
        <p className="headline-text">{item.headline}</p>

        {/* Meta Line */}
        <div className="meta-line">
          {item.districtName} · {item.time} · {item.views} views
        </div>

        {/* Tag Chips */}
        <div className="tag-row">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right Action Rail */}
      <div className="right-action-rail">
        {/* 1. Like Button */}
        <button
          type="button"
          className="rail-action-btn"
          onClick={handleLike}
          aria-label="Like video"
        >
          <div className={`rail-icon-wrap ${likePopping ? "pop" : ""}`}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill={isLiked ? "var(--laal)" : "none"}
              stroke={isLiked ? "var(--laal)" : "var(--chrome)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="rail-count">{likeCount}</span>
        </button>

        {/* 2. Comment Button */}
        <button
          type="button"
          className="rail-action-btn"
          onClick={() => onOpenComments(item)}
          aria-label="Comments"
        >
          <div className="rail-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="rail-count">{item.commentsList.length}</span>
        </button>

        {/* 3. WhatsApp Share (Prominent 44px panel-2 circle) */}
        <button
          type="button"
          className="rail-action-btn"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: item.headline, url: window.location.href }).catch(() => {});
            }
          }}
          aria-label="Share"
        >
          <div className="whatsapp-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--chrome)">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0 0 12.04 2zm5.82 14.12c-.24.68-1.22 1.3-1.7 1.37-.48.07-1.1.1-3.23-.78-2.73-1.13-4.48-3.9-4.62-4.08-.14-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.24-.27.53-.34.7-.34.18 0 .36 0 .52.01.17.01.4.01.59.45.2.48.68 1.66.74 1.78.06.12.1.27.02.43-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.25.25-.11.49.14.24.63 1.04 1.35 1.68.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.26z" />
            </svg>
          </div>
          <span className="rail-count">Share</span>
        </button>

        {/* 4. More Options Button */}
        <button
          type="button"
          className="rail-action-btn"
          onClick={() => onOpenMore(item)}
          aria-label="More options"
        >
          <div className="rail-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </div>
        </button>
      </div>

      {/* Progress bar pinned to bottom of slide */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default function Feed() {
  const [activeDistrictKey, setActiveDistrictKey] = useState("durgapur");
  const [newsItems, setNewsItems] = useState<NewsVideo[]>(INITIAL_NEWS_ITEMS);
  const [activeSlideId, setActiveSlideId] = useState<string>("");
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [followedCreators, setFollowedCreators] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Sheet States
  const [commentSheetItem, setCommentSheetItem] = useState<NewsVideo | null>(null);
  const [actionSheetItem, setActionSheetItem] = useState<NewsVideo | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter items by district key
  const filteredItems = newsItems.filter((item) => {
    if (activeDistrictKey === "west-bengal" || activeDistrictKey === "india") {
      return true; // Broader scope shows all items
    }
    return item.districtKey === activeDistrictKey;
  });

  // IntersectionObserver to auto-play active video and pause others
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id) {
              setActiveSlideId(id);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    (Object.values(slideRefs.current) as (HTMLDivElement | null)[]).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredItems]);

  // Set initial active slide ID when filtered list changes
  useEffect(() => {
    if (filteredItems.length > 0) {
      setActiveSlideId(filteredItems[0].id);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    } else {
      setActiveSlideId("");
    }
  }, [activeDistrictKey]);

  const handleDistrictSelect = (key: string) => {
    setActiveDistrictKey(key);
  };

  const handleToggleFollow = (creator: string) => {
    setFollowedCreators((prev) => ({
      ...prev,
      [creator]: !prev[creator],
    }));
  };

  const handleLikeToggle = (id: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !commentSheetItem) return;

    const newComment: CommentItem = {
      id: "user_c_" + Date.now(),
      name: "You",
      text: newCommentText.trim(),
      time: "Just now",
      likes: 0,
    };

    setNewsItems((prev) =>
      prev.map((item) => {
        if (item.id === commentSheetItem.id) {
          return {
            ...item,
            commentsCount: item.commentsCount + 1,
            commentsList: [newComment, ...item.commentsList],
          };
        }
        return item;
      })
    );

    setCommentSheetItem((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        commentsCount: prev.commentsCount + 1,
        commentsList: [newComment, ...prev.commentsList],
      };
    });

    setNewCommentText("");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const isSheetOpen = Boolean(commentSheetItem || actionSheetItem);

  return (
    <div className="feed-backdrop">
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
          overflow: hidden;
        }

        .feed-backdrop {
          width: 100%;
          min-height: 100dvh;
          background-color: var(--panel);
          display: flex;
          justify-content: center;
        }

        .feed-shell {
          width: 100%;
          max-width: 430px;
          height: 100dvh;
          background-color: var(--void);
          position: relative;
          overflow: hidden;
        }

        /* Focus Ring for Keyboard Accessibility */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid var(--laal) !important;
          outline-offset: 2px !important;
        }

        /* Fixed Top Bar over Video */
        .top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 30;
          padding: 12px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: transparent;
          pointer-events: none;
        }

        .top-bar * {
          pointer-events: auto;
        }

        .top-bar-row1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .top-bar-text-shadow {
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        .top-bar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .top-icon-btn {
          background: transparent;
          border: none;
          color: var(--chrome);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6));
        }

        /* District Ribbon Strip */
        .district-ribbon {
          display: flex;
          align-items: center;
          gap: 16px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
          padding-bottom: 4px;
        }

        .district-ribbon::-webkit-scrollbar {
          display: none;
        }

        .district-chip {
          background: transparent;
          border: none;
          color: rgba(233, 236, 240, 0.55);
          font-family: 'Archivo', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }

        .district-chip.active {
          color: var(--chrome);
          font-weight: 600;
        }

        .district-chip.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--laal);
        }

        .chip-divider {
          width: 1px;
          height: 14px;
          background-color: rgba(233, 236, 240, 0.22);
          flex-shrink: 0;
        }

        /* Snap Scroll Container */
        .snap-container {
          width: 100%;
          height: 100dvh;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
          scrollbar-width: none;
        }

        .snap-container::-webkit-scrollbar {
          display: none;
        }

        .video-slide {
          width: 100%;
          height: 100dvh;
          scroll-snap-align: start;
          position: relative;
          overflow: hidden;
          background-color: var(--void);
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .loading-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--laal);
          z-index: 20;
          animation: pulseBar 1.2s infinite ease-in-out;
        }

        @keyframes pulseBar {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }

        .tap-feedback-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 25;
          opacity: 0.7;
          pointer-events: none;
        }

        /* Watermark & Mute Controls */
        .watermark-container {
          position: absolute;
          top: 80px;
          right: 16px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .watermark-logo {
          opacity: 0.55;
        }

        .mute-btn {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.15);
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--chrome);
        }

        /* Scrim & Overlay */
        .bottom-scrim {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to top, rgba(0,0,0,.86) 0%, rgba(0,0,0,.48) 38%, transparent 72%);
          pointer-events: none;
          z-index: 10;
        }

        .bottom-overlay {
          position: absolute;
          bottom: 12px;
          left: 16px;
          right: 72px; /* Clears right rail */
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .live-badge {
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

        .creator-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .creator-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .creator-name {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: var(--chrome);
        }

        .verified-badge {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background-color: var(--laal);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .follow-pill {
          background: transparent;
          border: 1px solid var(--chrome);
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 999px;
          cursor: pointer;
          transition: background-color 150ms ease;
        }

        .follow-pill.following {
          background-color: var(--chrome);
          color: var(--void);
        }

        .headline-text {
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          font-weight: 600;
          font-size: 15px;
          line-height: 1.35;
          color: var(--chrome);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meta-line {
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: rgba(233, 236, 240, 0.72);
        }

        .tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag-chip {
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: rgba(233, 236, 240, 0.85);
          border: 1px solid rgba(233, 236, 240, 0.28);
          padding: 2px 8px;
          border-radius: 999px;
        }

        /* Right Action Rail */
        .right-action-rail {
          position: absolute;
          right: 8px;
          bottom: 24px;
          width: 56px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .rail-action-btn {
          background: transparent;
          border: none;
          color: var(--chrome);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .rail-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 120ms ease;
        }

        .rail-icon-wrap.pop {
          transform: scale(1.25);
        }

        .whatsapp-circle {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rail-count {
          font-family: 'Archivo', sans-serif;
          font-weight: 500;
          font-size: 11px;
          color: var(--chrome);
        }

        .progress-track {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: rgba(233, 236, 240, 0.2);
          z-index: 25;
        }

        .progress-fill {
          height: 100%;
          background-color: var(--laal);
        }

        /* Floating Create Button */
        .floating-create-btn {
          position: absolute;
          bottom: 100px;
          right: 8px;
          width: 56px;
          height: 56px;
          border-radius: 999px;
          background-color: var(--laal);
          border: none;
          color: var(--chrome);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 30;
          transition: transform 100ms ease;
        }

        .floating-create-btn:active {
          transform: scale(0.94);
        }

        /* Empty State */
        .empty-feed-container {
          width: 100%;
          height: 100dvh;
          background-color: var(--void);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
        }

        .empty-logo-wrap {
          opacity: 0.3;
          margin-bottom: 20px;
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
          margin-bottom: 24px;
        }

        .empty-action-pill {
          background-color: var(--laal);
          color: #FFFFFF;
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 12px 28px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
        }

        /* Sheet Backdrop */
        .sheet-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .bottom-sheet {
          width: 100%;
          max-width: 430px;
          height: 72dvh;
          background-color: var(--panel);
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          border-top: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          animation: slideUp 200ms ease forwards;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .drag-handle-bar {
          width: 36px;
          height: 4px;
          background-color: var(--line);
          border-radius: 2px;
          margin: 10px auto 4px;
        }

        .sheet-header {
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
        }

        .sheet-title {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: var(--chrome);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sheet-count {
          font-weight: 500;
          font-size: 13px;
          color: var(--chrome-soft);
        }

        .sheet-close-btn {
          background: transparent;
          border: none;
          color: var(--chrome);
          cursor: pointer;
        }

        .comments-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .comment-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .comment-avatar {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background-color: var(--panel-2);
          border: 1px solid var(--line);
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .comment-content {
          flex: 1;
        }

        .comment-author {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: var(--chrome);
          margin-bottom: 2px;
        }

        .comment-body {
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          font-size: 13px;
          color: var(--chrome);
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .comment-time {
          font-family: 'Archivo', sans-serif;
          font-size: 11px;
          color: var(--chrome-soft);
        }

        .comment-composer {
          padding: 12px 16px;
          background-color: var(--panel);
          border-top: 1px solid var(--line);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .comment-input {
          flex: 1;
          height: 44px;
          background-color: var(--panel-2);
          border: none;
          border-radius: 999px;
          padding: 0 16px;
          color: var(--chrome);
          font-family: 'Archivo', 'Anek Devanagari', 'Anek Bangla', sans-serif;
          font-size: 13px;
        }

        .comment-input::placeholder {
          color: var(--chrome-soft);
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background-color: var(--laal);
          border: none;
          color: var(--chrome);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* Action Sheet Options */
        .action-sheet-options {
          display: flex;
          flex-direction: column;
          padding: 12px 0;
        }

        .action-row-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--line);
          padding: 16px 20px;
          color: var(--chrome);
          font-family: 'Archivo', sans-serif;
          font-size: 15px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
        }

        .action-row-btn:last-child {
          border-bottom: none;
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

      <main className="feed-shell">
        {/* Fixed Top Bar */}
        <header className="top-bar">
          <div className="top-bar-row1">
            <Logo height={22} />
            <div className="top-bar-actions">
              <button type="button" className="top-icon-btn" aria-label="Search">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
              <button type="button" className="top-icon-btn" aria-label="Notifications">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </button>
            </div>
          </div>

          {/* District Ribbon */}
          <div className="district-ribbon" role="tablist" aria-label="District selection">
            {DISTRICT_CHIPS.map((chip, idx) => {
              const isActive = activeDistrictKey === chip.key;
              const isWiderScope = chip.scope !== "district";
              const showDivider = isWiderScope && idx > 0 && DISTRICT_CHIPS[idx - 1].scope === "district";

              return (
                <React.Fragment key={chip.key}>
                  {showDivider && <div className="chip-divider" />}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`district-chip ${isActive ? "active" : ""}`}
                    onClick={() => handleDistrictSelect(chip.key)}
                  >
                    {chip.isOwn && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--laal)" stroke="var(--laal)">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                      </svg>
                    )}
                    {chip.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </header>

        {/* Snap Scroll Video Feed */}
        {filteredItems.length > 0 ? (
          <div className="snap-container" ref={containerRef}>
            {filteredItems.map((item) => {
              const isLiked = Boolean(likedPosts[item.id]);
              const currentLikeCount = item.likes + (isLiked ? 1 : 0);
              const isFollowing = Boolean(followedCreators[item.creator]);

              return (
                <div
                  key={item.id}
                  data-id={item.id}
                  ref={(el) => (slideRefs.current[item.id] = el)}
                >
                  <VideoSlide
                    item={item}
                    isActive={activeSlideId === item.id}
                    isGlobalMuted={isGlobalMuted}
                    isSheetOpen={isSheetOpen}
                    onToggleGlobalMuted={() => setIsGlobalMuted((m) => !m)}
                    onLikeToggle={handleLikeToggle}
                    isLiked={isLiked}
                    likeCount={currentLikeCount}
                    onOpenComments={(v) => setCommentSheetItem(v)}
                    onOpenMore={(v) => setActionSheetItem(v)}
                    isFollowing={isFollowing}
                    onToggleFollow={handleToggleFollow}
                    onPostNews={() => showToast("Post news feature opened")}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State when district has no videos */
          <div className="empty-feed-container">
            <div className="empty-logo-wrap">
              <Logo height={40} />
            </div>
            <h2 className="empty-title">No news here yet</h2>
            <p className="empty-sub">Be the first to report from this district.</p>
            <button
              type="button"
              className="empty-action-pill"
              onClick={() => showToast("Post news feature opened")}
            >
              Post news
            </button>
          </div>
        )}

        {/* Floating Create Button */}
        <button
          type="button"
          className="floating-create-btn"
          aria-label="Post news"
          onClick={() => showToast("Post news feature opened")}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="3" strokeLinecap="square">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Comment Sheet */}
        {commentSheetItem && (
          <div className="sheet-backdrop" onClick={() => setCommentSheetItem(null)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="drag-handle-bar" />
              <div className="sheet-header">
                <div className="sheet-title">
                  Comments <span className="sheet-count">({commentSheetItem.commentsCount})</span>
                </div>
                <button
                  type="button"
                  className="sheet-close-btn"
                  onClick={() => setCommentSheetItem(null)}
                  aria-label="Close comments"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="comments-list">
                {commentSheetItem.commentsList.map((c) => (
                  <div key={c.id} className="comment-row">
                    <div className="comment-avatar">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-author">{c.name}</div>
                      <div className="comment-body">{c.text}</div>
                      <div className="comment-time">{c.time}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--chrome-soft)", fontSize: "11px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {c.likes > 0 && c.likes}
                    </div>
                  </div>
                ))}
              </div>

              <form className="comment-composer" onSubmit={handleAddComment}>
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Add a comment"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newCommentText.trim()}
                  aria-label="Send comment"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--chrome)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Action Sheet (More Options) */}
        {actionSheetItem && (
          <div className="sheet-backdrop" onClick={() => setActionSheetItem(null)}>
            <div className="bottom-sheet" style={{ height: "auto", paddingBottom: "20px" }} onClick={(e) => e.stopPropagation()}>
              <div className="drag-handle-bar" />
              <div className="action-sheet-options">
                <button
                  type="button"
                  className="action-row-btn"
                  onClick={() => {
                    setActionSheetItem(null);
                    showToast("Report submitted");
                  }}
                >
                  Report this
                </button>
                <button
                  type="button"
                  className="action-row-btn"
                  onClick={() => {
                    setActionSheetItem(null);
                    showToast("Video hidden");
                  }}
                >
                  Not interested
                </button>
                <button
                  type="button"
                  className="action-row-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setActionSheetItem(null);
                    showToast("Link copied to clipboard");
                  }}
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Popup */}
        {toastMessage && <div className="toast-popup">{toastMessage}</div>}
      </main>
    </div>
  );
}
