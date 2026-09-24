import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className="h-full antialiased">
      <body className={`${poppins.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
