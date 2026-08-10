import Link from "next/link";
import { Header, Footer } from "./components/Chrome";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="wrap" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Page not found</h1>
        <p style={{ color: "var(--ink-soft)", marginTop: 8 }}>This page has moved or never existed.</p>
        <Link href="/" className="cta" style={{ display: "inline-block", marginTop: 20, lineHeight: "38px", textDecoration: "none" }}>
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
