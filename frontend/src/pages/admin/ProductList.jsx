import React, { useState } from "react";
import { Link } from "react-router-dom";

const initialProducts = [
  { id: "p1", name: "T-Shirt", price: 19.99, stock: 12 },
  { id: "p2", name: "Sneakers", price: 59.99, stock: 5 },
  { id: "p3", name: "Jacket", price: 89.99, stock: 3 },
];

const ProductList = () => {
  const [products, setProducts] = useState(initialProducts);

  const handleDelete = (id) => {
    if (!confirm("Delete this product?")) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Link
          to="/admin/products/new"
          className="px-3 py-2 bg-indigo-600 text-white rounded"
        >
          Add product
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">${p.price.toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <Link
                    to={`/admin/products/${p.id}`}
                    className="mr-2 text-indigo-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
