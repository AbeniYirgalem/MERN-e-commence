import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const dummyProduct = { id: "p1", name: "T-Shirt", price: 19.99, stock: 12 };

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ id: "", name: "", price: "", stock: "" });

  useEffect(() => {
    if (isEdit) {
      // load dummy product
      setForm({ ...dummyProduct });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // UI-only: pretend save
    alert(isEdit ? "Product updated (UI only)" : "Product added (UI only)");
    navigate("/admin/products");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {isEdit ? "Edit" : "Add"} product
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-xl"
      >
        <div className="mb-3">
          <label className="block text-sm mb-1">ID</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Price</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Stock</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded mr-2">
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
