import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/me/",
    },
    sitemap: `https://secret-love.vercel.app/sitemap.xml`,
  };
}
