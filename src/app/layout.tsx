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
  title: "ScanTell – Understand Your Documents with AI",

  description:
    "ScanTell uses AI and OCR to help you understand important documents faster. Upload insurance policies and paperwork to discover key details, answers, and questions you should be asking.",

  keywords: [
    "AI document assistant",
    "document understanding AI",
    "insurance policy assistant",
    "AI OCR",
    "document summarizer",
    "insurance document analysis",
    "personal document assistant",
  ],

  authors: [{ name: "ScanTell" }],

  openGraph: {
    title: "ScanTell – Understand Your Documents with AI",
    description:
      "Stop searching through pages of documents. ScanTell uses AI to explain important information, answer questions, and highlight details you might miss.",

    url: "https://scantell.vercel.app",
    siteName: "ScanTell",
    type: "website",

    images: [
      {
        url: "/scantell-logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "ScanTell - AI document understanding assistant",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "ScanTell – Understand Your Documents with AI",

    description:
      "Upload documents and let AI explain important details, answer questions, and highlight what matters most.",

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
