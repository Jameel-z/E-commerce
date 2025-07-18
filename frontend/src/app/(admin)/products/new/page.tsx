import { getAuthToken } from "@/lib/auth";
import ProductForm from "@/components/admin/ProductForm";
import { apiClient } from "@/lib/types/apiClient";
import { ProductCreate } from "@/lib/types/apiTypes";

export default async function CreateProductPage() {
  const token = await getAuthToken();

  const handleSubmit = async (data: ProductCreate) => {
    "use server";
    try {
      // await apiClient.createProduct(productData, token);
      await apiClient.createProduct(
        {
          name: data.name,
          price: Number(data.price),
          description: data.description,
          stock_quantity: data.stock_quantity,
          category_id: data.category_id || 1,
        },
        token
      );

      return { success: true, redirectTo: "/products" };
    } catch (error) {
      console.error("Product creation failed:", error);
      return {
        error: error instanceof Error ? error.message : "Creating fa failed",
      };
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
      <ProductForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
