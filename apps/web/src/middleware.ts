import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

const ALG = "HS256";
const SESSION_COOKIE = "tzn_session";

/** Routes reachable without a session. */
const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);

/** Routes that require an admin session. */
const ADMIN_PREFIX = "/admin";

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

function sessionOf(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return Promise.resolve(null);
  return jwtVerify(token, secretKey(), { algorithms: [ALG] })
    .then(({ payload }) => payload)
    .catch(() => null);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await sessionOf(req);
  const authed = Boolean(session?.sub);

  const needsAuth = !PUBLIC_ROUTES.has(pathname) && !pathname.startsWith("/admin");
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX);

  // Protected area, no session → go log in (preserve the intended destination).
  if (!authed && (needsAuth || needsAdmin)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Admin area, but not an admin → land on the student home.
  if (authed && needsAdmin && session!.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Already signed in, hitting a public auth page → go to their home.
  if (authed && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = session!.role === "ADMIN" ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}