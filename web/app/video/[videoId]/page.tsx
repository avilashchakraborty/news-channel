import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getVideo } from "../../lib/data";
import { Header, Footer } from "../../components/Chrome";
import VideoPlayer from "../../components/VideoPlayer";

export const revalidate = 300;

type Params = { videoId: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const v = await getVideo(params.videoId);
  if (!v) return { title: "Video not found", robots: { index: false, follow: false } };
  const img = v.thumbnailUrl ?? `https://picsum.photos/seed/gplus-${v.seed}/1200/630`;
  return {
    title: v.headline,
    description: `${v.place} · ${v.date} — watch on G+ India News.`,
    alternates: { canonical: `/video/${v.id}` },
    openGraph: { title: v.headline, description: v.place, images: [img], type: "video.other" },
    twitter: { card: "summary_large_image", title: v.headline, images: [img] },
  };
}

export default async function VideoPage({ params }: { params: Params }) {
  const v = await getVideo(params.videoId);
  if (!v) notFound();

  // JSON-LD for rich video results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.headline,
    description: `${v.place} · ${v.date}`,
    thumbnailUrl: [v.thumbnailUrl ?? `https://picsum.photos/seed/gplus-${v.seed}/1200/630`],
    uploadDate: v.date,
    contentUrl: `https://news-channel-one.vercel.app/video/${v.id}`,
  };

  return (
    <>
      <Header />
      <main className="wrap">
        <article className="detail">
          <VideoPlayer video={v} playbackUrl={v.playbackUrl} />
          <div className="tagrow">
            <span className="pill brand">{v.category}</span>
            <Link href={`/gplus/district/${v.districtId}`} className="pill">
              {v.districtName}
            </Link>
          </div>
          <h1>{v.headline}</h1>
          <p style={{ color: "var(--ink-soft)", marginTop: 8 }}>
            {v.creatorName} · {v.place} · {v.date}
          </p>
          <p style={{ marginTop: 16, lineHeight: 1.6, color: "var(--ink-soft)" }}>
            This report appears on the public web for search and sharing. Video playback connects to the reporter feed
            (Bunny Stream) once the backend is live.
          </p>

          {/* Sponsored "You might like" — served by getAds (targeted, approved) in production. */}
          <a
            href="https://example.com/puja"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 24, padding: 12, borderRadius: 12, border: "1px solid var(--line)", background: "var(--wash)", textDecoration: "none", color: "inherit" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://picsum.photos/seed/gplus-sponsored-puja/240/240" alt="" style={{ width: 88, height: 88, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", color: "var(--ink-soft)" }}>SPONSORED · YOU MIGHT LIKE</span>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, margin: "4px 0" }}>Biggest Puja offers at City Centre — up to 60% off</div>
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>Durgapur Traders Association</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "var(--brand)", padding: "8px 14px", borderRadius: 999, whiteSpace: "nowrap" }}>Shop now</span>
          </a>
        </article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </>
  );
}
