import React from "react";

interface ProductFormProps {
  mode: "create" | "edit";
  product?: any;
  categories: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ mode, onSuccess, onCancel }: ProductFormProps) {
  return (
    <div className="p-4 border rounded-lg bg-white mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {mode === "edit" ? "Edit Product" : "Add New Product"}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Product form will go here. This is a test component.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onSuccess}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {mode === "edit" ? "Update" : "Create"} Product
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
