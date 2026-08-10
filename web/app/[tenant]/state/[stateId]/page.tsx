import type { Metadata } from "next";
import { getVideos } from "../../../lib/data";
import { Header, Chips, Footer } from "../../../components/Chrome";
import { Section } from "../../../components/VideoCard";

export const revalidate = 300;

type Params = { tenant: string; stateId: string };

function title(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const name = title(params.stateId);
  return {
    title: `${name} news`,
    description: `Video news from across ${name} on G+ India News.`,
    alternates: { canonical: `/${params.tenant}/state/${params.stateId}` },
  };
}

export default async function StatePage({ params }: { params: Params }) {
  const videos = await getVideos({ tenantId: params.tenant, state: params.stateId, limit: 48 });
  const name = title(params.stateId);

  return (
    <>
      <Header active={name} />
      <main className="wrap">
        <Chips />
        <Section title={`${name} news`} items={videos} />
        {videos.length === 0 && (
          <p style={{ padding: "40px 0", color: "var(--ink-soft)" }}>No videos yet from {name}.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
