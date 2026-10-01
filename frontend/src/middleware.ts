import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAccountRoute = req.nextUrl.pathname.startsWith("/account");
  const isLoggedIn = !!req.auth?.user;
  const isLoggedInAsStaff = req.auth?.user?.role === "ADMIN" || req.auth?.user?.role === "STAFF";

  const needsAuth = (isAdminRoute && !isLoggedInAsStaff) || (isAccountRoute && !isLoggedIn);

  if (needsAuth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
