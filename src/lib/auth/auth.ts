import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/server/db";

const appUrl = process.env.APP_URL;
const authSecret = process.env.AUTH_SECRET;

if (!appUrl) {
  throw new Error("APP_URL must be configured for authentication.");
}

if (!authSecret || authSecret.length < 32) {
  throw new Error("AUTH_SECRET must contain at least 32 characters.");
}

const trustedOrigins = (process.env.AUTH_TRUSTED_ORIGINS ?? appUrl)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  appName: process.env.APP_NAME ?? "SoundScape",
  baseURL: appUrl,
  secret: authSecret,
  trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
