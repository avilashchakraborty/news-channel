import type { Metadata } from "next";
import "./globals.css";

const SITE = "G+ India News";
const DESC = "Hyperlocal district video news from across India — civic reports, breaking news and voices from your neighbourhood.";

export const metadata: Metadata = {
  metadataBase: new URL("https://news-channel-one.vercel.app"),
  title: {
    default: `${SITE} — District video news`,
    template: `%s · ${SITE}`,
  },
  description: DESC,
  applicationName: SITE,
  openGraph: {
    siteName: SITE,
    title: `${SITE} — District video news`,
    description: DESC,
    type: "website",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: SITE, description: DESC },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@400;600&family=Anek+Devanagari:wght@400;600;700&family=Archivo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
