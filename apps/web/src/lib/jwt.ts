import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { SessionUser } from "@tuiton/shared";

export const SESSION_COOKIE = "tzn_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const ALG = "HS256";

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET env var is required");
  return new TextEncoder().encode(secret);
}

/** Sign a session JWT for an authenticated actor. */
export async function signSession(user: Omit<SessionUser, "iat" | "exp">): Promise<string> {
  return new SignJWT(user as JWTPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** Verify a session JWT; returns the actor or null when invalid/expired. */
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALG] });
    const p = payload as SessionUser;
    if (!p.sub || !p.email || !p.role) return null;
    return { sub: p.sub, email: p.email, name: p.name, role: p.role };
  } catch {
    return null;
  }
}