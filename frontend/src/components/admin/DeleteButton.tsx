"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/types/apiClient";

interface DeleteButtonProps {
  productId: number;
  token: string;
  onDelete?: () => void;
}

export function DeleteButton({
  productId,
  token,
  onDelete,
}: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    setError(null);
    try {
      await apiClient.deleteProduct(productId, token);
      onDelete?.();
      router.refresh(); // Refresh the product list
    } catch (error) {
      alert(error instanceof Error ? error.message : "Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}
