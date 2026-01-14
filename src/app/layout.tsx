import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


export const metadata: Metadata = {
  title: "God's Will Empowerment Initiative Platform",
  description: "Comprehensive digital platform for managing funds.",
  icons: {
    icon: "/logo.webp"
  },
  openGraph: {
    title: "God's Will Empowerment Initiative Platform",
    description: "Comprehensive digital platform for managing funds.",
    url: "https://www.godswillempowerment.com",
    siteName: "God's Will Empowerment Initiative",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "God's Will Empowerment Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "God's Will Empowerment Initiative Platform",
    description: "Comprehensive digital platform for managing funds.",
    images: ["/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.godswillempowerment.com"),
};
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}