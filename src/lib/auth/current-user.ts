import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

export async function getOptionalCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
  };
}

export async function requireCurrentUser(
  returnTo = "/library",
): Promise<CurrentUser> {
  const user = await getOptionalCurrentUser();

  if (!user) {
    redirect(`/sign-in?callbackURL=${encodeURIComponent(returnTo)}`);
  }

  return user;
}
