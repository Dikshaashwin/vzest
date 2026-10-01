import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAccountRoute = request.nextUrl.pathname.startsWith("/account");

  if ((isAdminRoute || isAccountRoute) && !user) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
