import { useState, useEffect } from "react";
import {
  apiClient,
  type ProductDetail,
  type Category,
  type Product,
} from "@/lib/api";
import { useToast } from "@/shared/hooks/use-toast";

export const useProducts = () => {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories(),
      ]);

      // For admin, we need detailed product info, so we'll fetch each product's details
      // This is not the most efficient but works for now - could be optimized with a dedicated admin endpoint
      const detailedProductsPromises = productsData.map((product) =>
        apiClient.getProduct(product.id)
      );

      const detailedProducts = await Promise.all(detailedProductsPromises);

      setProducts(detailedProducts);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load products and categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await apiClient.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in component
    }
  };

  const refetch = () => {
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    categories,
    loading,
    refetch,
    deleteProduct,
  };
};
