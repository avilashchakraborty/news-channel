import type { Metadata } from "next";
import { getVideos } from "../../../lib/data";
import { Header, Chips, Footer } from "../../../components/Chrome";
import { Section } from "../../../components/VideoCard";

export const revalidate = 300;

type Params = { tenant: string; districtId: string };

function title(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const name = title(params.districtId);
  return {
    title: `${name} news`,
    description: `Latest video news from ${name} — civic reports, breaking news and local voices on G+ India News.`,
    alternates: { canonical: `/${params.tenant}/district/${params.districtId}` },
  };
}

export default async function DistrictPage({ params }: { params: Params }) {
  const videos = await getVideos({ tenantId: params.tenant, districtId: params.districtId, limit: 48 });
  const name = title(params.districtId);

  return (
    <>
      <Header active={name} />
      <main className="wrap">
        <Chips />
        <Section title={`News from ${name}`} items={videos} />
        {videos.length === 0 && (
          <p style={{ padding: "40px 0", color: "var(--ink-soft)" }}>
            No videos yet from {name}. Be the first to report — install the app.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
