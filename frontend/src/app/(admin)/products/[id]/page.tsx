import { apiClient } from "@/lib/types/apiClient";
import { notFound } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import ProductForm from "@/components/admin/ProductForm";
import { ProductUpdate } from "@/lib/types/apiTypes";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  // await params before using its property `id`
  const { id } = await params;

  const token = await getAuthToken();
  const product = await apiClient.getProductById(Number(id));

  if (!product) return notFound();

  const handleSubmit = async (data: ProductUpdate) => {
    "use server";
    try {
      await apiClient.updateProduct(
        Number(id),
        {
          name: data.name,
          price: Number(data.price),
          description: data.description,
          stock_quantity: data.stock_quantity,
          category_id: data.category_id,
        },
        token
      );

      return {
        success: true,
        redirectTo: "/products",
      };
    } catch (error: unknown) {
      console.error("Update failed:", error);
      return {
        error: error instanceof Error ? error.message : "Update failed",
      };
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm mode="edit" initialData={product} onSubmit={handleSubmit} />
    </div>
  );
}
