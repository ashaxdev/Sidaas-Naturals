import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "kmc_admin_token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me");

async function isValidToken(token) {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

function withPathname(req) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export default async function proxy(req) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApiRoute =
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/upload") ||
    (pathname.startsWith("/api/orders") && !pathname.startsWith("/api/orders/track"));

  const method = req.method;
  const isReadOnlyPublic =
    method === "GET" && (pathname.startsWith("/api/products") || pathname.startsWith("/api/categories"));

  const isPublicOrderCreate = pathname === "/api/orders" && method === "POST";

  if (!isAdminRoute && (!isAdminApiRoute || isReadOnlyPublic || isPublicOrderCreate)) {
    return withPathname(req);
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token || !(await isValidToken(token))) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return withPathname(req);
}

export const config = {
  matcher: ["/admin/:path*", "/api/products/:path*", "/api/categories/:path*", "/api/orders/:path*", "/api/upload/:path*"],
};