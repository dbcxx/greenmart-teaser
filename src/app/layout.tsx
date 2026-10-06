import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import Analytics from "@/components/Analytics";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://greenmart.ng";
const DESCRIPTION =
  "GreenMart connects Nigerian farmers and sellers directly with buyers. Join the waitlist as a farmer, seller or buyer.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "GreenMart: fresh from the farm, coming soon",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "GreenMart is growing",
    description: "Sell straight from your farm, or buy fresh food direct. Join the waitlist.",
    type: "website",
    siteName: "GreenMart",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenMart is growing",
    description: "Sell straight from your farm, or buy fresh food direct. Join the waitlist.",
  },
};

export const viewport: Viewport = { themeColor: "#1f4d2b" };

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GreenMart",
  url: SITE,
  description: DESCRIPTION,
  areaServed: { "@type": "Country", name: "Nigeria" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body className="antialiased">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <Analytics />
      </body>
    </html>
  );
}
