const requiredEnvVariables: string[] = [];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000",
} as const;