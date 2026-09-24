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
  title: {
    template: 'Memory',
    default: 'Memory'
  },
  description: "Lưu giữ kỉ niệm",
  icons: {
    icon: 'https://cdn-media.sforum.vn/storage/app/media/anhthem/meme-tinh-yeu-64.jpg',
  },
  openGraph: {
    locale: 'en_US',
    type: 'website',
    siteName: 'Memory',
    description: "Lưu giữ kỉ niệm",
    images: 'https://cdn-media.sforum.vn/storage/app/media/anhthem/meme-tinh-yeu-64.jpg'
  },
  twitter: {
    site: '@trungtn',
    title: 'Memory',
    description: 'Lưu giữ kỉ niệm',
    images: ['https://cdn-media.sforum.vn/storage/app/media/anhthem/meme-tinh-yeu-64.jpg']
  },
  metadataBase: new URL('https://acme.com'),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
