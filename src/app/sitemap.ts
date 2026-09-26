import { MetadataRoute } from "next";
export const dynamic = "force-static"
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://alphaflexindia.com",
      lastModified: new Date(),
    },
    {
      url: "https://alphaflexindia.com/contact",
      lastModified: new Date(),
    },
    {
      url: "https://alphaflexindia.com/products",
      lastModified: new Date(),
    },
  ];
}