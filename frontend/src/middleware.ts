import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATHS = [
  "/products", // Matches /products and /products/*
  "/dashboard", // Other admin paths
];

export function middleware(request: NextRequest) {
  const isAdminPath = ADMIN_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  const token = request.cookies.get("auth_token")?.value;

  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
