import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../redux/authSlice";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    dispatch(resetPassword({ token, password }))
      .unwrap()
      .then(() => {
        toast.success("Password reset successful");
        navigate("/login");
      })
      .catch((err) => {
        toast.error(err?.message || "Reset failed");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">
          Reset password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white placeholder-gray-400 border border-gray-700"
              placeholder="New password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white placeholder-gray-400 border border-gray-700"
              placeholder="Confirm password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-500 transition text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
