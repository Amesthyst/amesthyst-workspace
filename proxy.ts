import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export function proxy(request: NextRequest) {

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const isProtected =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/onboarding");

  const userToken =
    request.cookies.get("sb-access-token")?.value;

  if (!userToken && isProtected) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (userToken && isAuthPage) {
    return NextResponse.redirect(
      new URL("/portal/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};