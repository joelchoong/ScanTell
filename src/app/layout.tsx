import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScanTell – Understand Your Documents Instantly",
  description:
    "ScanTell uses OCR and AI to extract, summarise, and explain important information from your documents. Start with insurance policies and quickly understand what matters most without reading the full document.",

  keywords: [
    "OCR app",
    "document scanner",
    "insurance document scanner",
    "AI document summarizer",
    "policy explanation",
    "document AI",
    "scan and extract text",
    "insurance clarity app",
  ],

  authors: [{ name: "ScanTell" }],

  openGraph: {
    title: "ScanTell – Understand Your Documents Instantly",
    description:
      "Upload documents and instantly get key insights, summaries, and explanations. Built for insurance policies and important paperwork.",
    url: "https://scantell.vercel.app",
    siteName: "ScanTell",
    type: "website",
    images: [
      {
        url: "/scantell-logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "ScanTell - Document understanding made simple",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ScanTell – Understand Your Documents Instantly",
    description:
      "AI-powered OCR that extracts and explains key info from insurance and important documents.",
    images: ["/scantell-logo-horizontal.png"],
  },

  icons: {
    icon: "/scantell.svg",
  },

  metadataBase: new URL("https://scantell.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
