import type { Metadata } from "next";
import { getVideos } from "../../../lib/data";
import { Header, Chips, Footer } from "../../../components/Chrome";
import { Section } from "../../../components/VideoCard";

export const revalidate = 300;

type Params = { tenant: string; tag: string };

function title(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const name = title(params.tag);
  return {
    title: `${name} news`,
    description: `${name} video news and updates on G+ India News.`,
    alternates: { canonical: `/${params.tenant}/tag/${params.tag}` },
  };
}

export default async function TagPage({ params }: { params: Params }) {
  const videos = await getVideos({ tenantId: params.tenant, category: params.tag, limit: 48 });
  const name = title(params.tag);

  return (
    <>
      <Header />
      <main className="wrap">
        <Chips active={name} />
        <Section title={name} items={videos} />
        {videos.length === 0 && (
          <p style={{ padding: "40px 0", color: "var(--ink-soft)" }}>No {name} videos right now.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
