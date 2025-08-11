// src/app/api/auth/clear-token/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  // More secure cookie deletion
  response.cookies.set({
    name: "auth_token",
    value: "",
    expires: new Date(0), // Immediately expire
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
