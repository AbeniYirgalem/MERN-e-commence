import React, { useState } from "react";

const EditProfile = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit profile</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
            <button className="px-3 py-2 bg-indigo-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
