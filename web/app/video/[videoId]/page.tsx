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
        </article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </main>
      <Footer />
    </>
  );
}
