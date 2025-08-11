// src/app/(admin)/dashboard/page.tsx
import { apiClient } from "@/lib/types/apiClient";
import Link from "next/link";
import ProductTable from "@/components/admin/ProductTable";
import { getAuthToken } from "@/lib/auth";

export default async function AdminProductsPage() {
  const token = (await getAuthToken()) || "";
  let products = [];

  try {
    products = await apiClient.getAllProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
        <p className="text-red-600">Failed to load products.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Link
          href="/dashboard/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </Link>
      </div>
      <ProductTable products={products} token={token} />
    </div>
  );
}
