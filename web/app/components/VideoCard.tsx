import Link from "next/link";
import { FeedVideo } from "../lib/types";

const GRADIENTS = [
  "linear-gradient(135deg,#1B2A3D,#33506F)",
  "linear-gradient(135deg,#2E2340,#5B4A7A)",
  "linear-gradient(135deg,#10332C,#1F6B57)",
  "linear-gradient(135deg,#3D1F1F,#7A3B3B)",
  "linear-gradient(135deg,#3A2E12,#6E571F)",
  "linear-gradient(135deg,#122A3A,#255873)",
];

function PlayIcon() {
  return (
    <span className="play">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

export function Thumb({ video, index = 0 }: { video: FeedVideo; index?: number }) {
  const src = video.thumbnailUrl ?? `https://picsum.photos/seed/gplus-${video.seed}/480/360`;
  return (
    <div className="thumb">
      <div className="grad" style={{ background: GRADIENTS[index % GRADIENTS.length] }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" />
      <div className="scrim" />
      {video.isLive && <span className="live">LIVE</span>}
      <PlayIcon />
    </div>
  );
}

export default function VideoCard({ video, index = 0 }: { video: FeedVideo; index?: number }) {
  return (
    <Link href={`/video/${video.id}`} className="card">
      <Thumb video={video} index={index} />
      <h3>{video.headline}</h3>
      <span className="meta">
        {video.place} · {video.date}
      </span>
    </Link>
  );
}

export function Grid({ items }: { items: FeedVideo[] }) {
  return (
    <div className="grid">
      {items.map((v, i) => (
        <VideoCard key={v.id} video={v} index={i} />
      ))}
    </div>
  );
}

export function Section({ title, items, moreHref }: { title: string; items: FeedVideo[]; moreHref?: string }) {
  if (!items.length) return null;
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {moreHref && (
          <Link href={moreHref} className="more">
            View More
          </Link>
        )}
      </div>
      <Grid items={items} />
    </section>
  );
}
