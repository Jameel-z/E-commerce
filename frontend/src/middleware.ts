// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PATHS = ["/admin", "/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  // Only check for token presence - detailed validation happens in layout
  if (!token) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("auth_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
