import { MetadataRoute } from "next";

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