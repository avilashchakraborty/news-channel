import { getVideos } from "./lib/data";
import { Header, Chips, Tiles, Footer } from "./components/Chrome";
import { Section } from "./components/VideoCard";

export const revalidate = 300; // ISR — rebuilt on publish via /api/revalidate

const TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "gplus";

export default async function Home() {
  const all = await getVideos({ tenantId: TENANT, limit: 48 });
  const top = all.filter((v) => v.category === "Breaking" || v.state === "India").slice(0, 5);
  const durgapur = all.filter((v) => v.districtId === "durgapur").slice(0, 5);
  const viral = all.filter((v) => v.category === "Viral").slice(0, 5);
  const kolkata = all.filter((v) => v.districtId === "kolkata").slice(0, 5);

  return (
    <>
      <Header />
      <main className="wrap">
        <Chips />
        <Tiles />
        <Section title="Top stories" items={top.length ? top : all.slice(0, 5)} />
        <Section title="Durgapur" items={durgapur} moreHref={`/${TENANT}/district/durgapur`} />
        <Section title="Viral" items={viral} moreHref={`/${TENANT}/tag/viral`} />
        <Section title="Kolkata" items={kolkata} moreHref={`/${TENANT}/district/kolkata`} />
      </main>
      <Footer />
    </>
  );
}
