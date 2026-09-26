export const siteConfig = {
  name: "Alpha Flex India",

  description:
    "Alpha Flex India - Flexible packaging and packaging solutions.",

  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000",

  currency: "INR",

  currencySymbol: "₹",

  defaultGstPercent: 18,

  support: {
    email: "info@alphaflexindia.com",
  },
} as const;