import "server-only";

import { cookies } from "next/headers";
import type { SessionUser } from "@tuiton/shared";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./jwt";

/** Current-request cookie flags. Secure only when not on plain http localhost. */
function cookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

/** Write a signed session cookie for the given actor. */
export async function createSession(actor: Omit<SessionUser, "iat" | "exp">): Promise<void> {
  const token = await signSession(actor);
  cookies().set(SESSION_COOKIE, token, cookieOptions());
}

/** Read and verify the current request's session cookie, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Clear the session cookie (logout). */
export async function destroySession(): Promise<void> {
  cookies().set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}