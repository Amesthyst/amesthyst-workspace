import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(
  request: NextRequest
) {
  let response =
    NextResponse.next();

  const supabase =
    createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet
          ) {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  const { pathname } =
    request.nextUrl;

  const isAuthPage =
    pathname.startsWith(
      "/login"
    ) ||
    pathname.startsWith(
      "/register"
    );

  const isProtected =
    pathname.startsWith(
      "/portal"
    ) ||
    pathname.startsWith(
      "/onboarding"
    );

  if (!user && isProtected) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(
      new URL(
        "/portal/dashboard",
        request.url
      )
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};