// src/app/api/auth/validate-token/route.ts
import { NextResponse } from "next/server";
import { apiClient } from "@/lib/types/apiClient";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Validate token exists and is a string
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, error: "Valid token string is required" },
        { status: 400 }
      );
    }

    // Verify token by fetching current user
    await apiClient.getCurrentUser(token);

    return NextResponse.json({
      valid: true,
      expiresIn: 3600, // Optional: Add token expiration info if available
    });
  } catch (error) {
    console.error("Token validation failed:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Invalid or expired token",
        shouldRefresh: true, // Optional: Signal client to attempt refresh
      },
      { status: 401 }
    );
  }
}
