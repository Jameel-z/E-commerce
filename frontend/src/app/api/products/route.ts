import { NextResponse } from "next/server";
import { Product } from "@/lib/types/apiTypes";

// Union type for all possible response types
type ApiResponse = Product[] | { error: string };

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    // Forward request to FastAPI backend
    const res = await fetch("http://localhost:8000/products");
    if (!res.ok) throw new Error("failed to fetch products (${res.status})");

    const data: Product[] = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
