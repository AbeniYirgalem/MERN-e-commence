import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../redux/authSlice";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }))
      .unwrap()
      .then(() => {
        toast.success("If that email exists, a reset link has been sent");
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to send reset link");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">
          Forgot password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-transparent text-white placeholder-gray-400 border border-gray-700"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-500 transition text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
