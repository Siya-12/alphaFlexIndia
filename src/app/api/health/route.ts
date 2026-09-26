import { env } from "@/lib/env";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  return successResponse({
    application: "Alpha Flex India",
    status: "healthy",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
}