// src/components/admin/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCreate, ProductUpdate } from "@/lib/types/apiTypes";

type SubmitResponse = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

type ProductFormProps =
  | {
      mode: "create";
      onSubmit: (data: ProductCreate) => Promise<SubmitResponse>;
    }
  | {
      mode: "edit";
      initialData: ProductUpdate;
      onSubmit: (data: ProductUpdate) => Promise<SubmitResponse>;
    };

type FormState = {
  name: string;
  price: number;
  description: string;
  stock_quantity: number;
  category_id: number;
};

const toFormState = (data: Partial<ProductUpdate>): FormState => ({
  name: data.name ?? "",
  price: data.price ? Number(data.price) : 0,
  description: data.description ?? "",
  stock_quantity: data.stock_quantity ?? 0,
  category_id: data.category_id ?? 1,
});

export default function ProductForm(props: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(() =>
    props.mode === "edit" ? toFormState(props.initialData) : toFormState({})
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let result: SubmitResponse;

      if (props.mode === "create") {
        result = await props.onSubmit(formData);
      } else {
        result = await props.onSubmit({
          ...props.initialData,
          ...formData,
        });
      }

      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        router.push(result.redirectTo);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6 border border-gray-200"
    >
      <h2 className="text-xl font-semibold text-center mb-4">
        {props.mode === "edit" ? "Edit Product" : "Add New Product"}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            required
            placeholder="Product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            required
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Stock Quantity
          </label>
          <input
            name="stock_quantity"
            type="number"
            min={0}
            value={formData.stock_quantity}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            required
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category ID</label>
          <input
            name="category_id"
            type="number"
            min={1}
            value={formData.category_id}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            required
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Product description"
            rows={3}
          />
        </div>
      </div>

      {error && <div className="text-red-600 text-center">{error}</div>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        disabled={submitting}
      >
        {submitting
          ? props.mode === "edit"
            ? "Updating..."
            : "Creating..."
          : props.mode === "edit"
          ? "Update"
          : "Create"}{" "}
        Product
      </button>
    </form>
  );
}
