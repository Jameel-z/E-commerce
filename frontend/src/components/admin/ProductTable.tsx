import Link from "next/link";
import { Product } from "@/lib/types/apiTypes";
import { DeleteButton } from "./DeleteButton";

interface ProductTableProps {
  products: Product[];
  token: string;
}

export default function ProductTable({ products, token }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Price</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="py-2 px-4 border-b">{product.id}</td>
              <td className="py-2 px-4 border-b">{product.name}</td>
              <td className="py-2 px-4 border-b">${product.price}</td>
              <td className="py-2 px-4 border-b">
                <Link
                  href={`/products/${product.id}`}
                  className="text-blue-600 hover:underline mr-3"
                >
                  Edit
                </Link>
                <DeleteButton productId={product.id} token={token} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
