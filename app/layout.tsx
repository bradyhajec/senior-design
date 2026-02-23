import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdant — AI Plant Care",
  description: "Intelligent plant identification, health assessment, and care guidance powered by AI.",
  keywords: "plant care, plant identification, AI, houseplants, gardening",
  openGraph: {
    title: "Verdant — AI Plant Care",
    description: "Intelligent plant identification, health assessment, and care guidance powered by AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
