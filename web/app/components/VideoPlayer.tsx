"use client";

import { useState } from "react";
import { FeedVideo } from "../lib/types";

const GRAD = "linear-gradient(135deg,#1B2A3D,#33506F)";

// Poster → tap to play. Native HLS works in Safari/iOS; for other browsers wire
// hls.js here when you connect the real Bunny playback URL.
export default function VideoPlayer({ video, playbackUrl }: { video: FeedVideo; playbackUrl?: string | null }) {
  const [playing, setPlaying] = useState(false);
  const poster = video.thumbnailUrl ?? `https://picsum.photos/seed/gplus-${video.seed}/1280/720`;

  if (playing && playbackUrl) {
    return (
      <div className="player">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={playbackUrl} poster={poster} controls autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <button
      className="player"
      onClick={() => setPlaying(true)}
      style={{ border: "none", padding: 0, cursor: "pointer", display: "block" }}
      aria-label="Play video"
    >
      <div style={{ position: "absolute", inset: 0, background: GRAD }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
      <span className="play" style={{ width: 66, height: 66 }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      {!playbackUrl && (
        <span style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>
          Preview — playback connects to the reporter feed
        </span>
      )}
    </button>
  );
}
