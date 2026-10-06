import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: "GreenMart — Fresh from the farm, coming soon",
  description:
    "GreenMart connects Nigerian farmers and sellers directly with buyers. Join the waitlist as a farmer, seller or buyer.",
  openGraph: {
    title: "GreenMart is growing",
    description: "Sell straight from your farm, or buy fresh food direct. Join the waitlist.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
