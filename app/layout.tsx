import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {

    title:
        "AIIMS Pediatric Neurology Follow-up",

    description:
        "Secure pediatric neurology follow-up system",

    openGraph: {

        title:
            "AIIMS Pediatric Neurology Follow-up",

        description:
            "Secure pediatric neurology follow-up system",

        url:
            "https://pedneuro-followup.vercel.app",

        siteName:
            "AIIMS Pediatric Neurology Follow-up",

        images: [
            {
                url:
                    "https://pedneuro-followup.vercel.app/opengraph-image.webp",

                width: 1024,
                height: 1024,

                alt:
                    "AIIMS Pediatric Neurology Follow-up",
            },
        ],

        locale:
            "en_US",

        type:
            "website",
    },

    twitter: {

        card:
            "summary_large_image",

        title:
            "AIIMS Pediatric Neurology Follow-up",

        description:
            "Secure pediatric neurology follow-up system",

        images: [
            "https://pedneuro-followup.vercel.app/opengraph-image.webp",
        ],
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
