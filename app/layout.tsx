import { Poppins } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const poppins = Poppins({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://secret-love-pearl.vercel.app/mazerose"),
  title: {
    default: "Memory",
    template: "%s | Memory",
  },
  description: "Lưu giữ kỉ niệm",
  openGraph: {
    siteName: "Memory",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@trungtn",
  },
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${poppins.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
