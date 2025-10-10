import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/authSlice";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { user, error, loading } = useSelector((state) => state.auth);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })
    )
      .unwrap()
      .then((res) => {
        toast.success("Account created");
        navigate("/");
      })
      .catch((e) => {
        const msg = e?.message || e?.error || "Signup failed";
        setErrors((prev) => ({ ...prev, form: msg }));
      });
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center text-white">
          Create an account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white placeholder-gray-400 border ${
                errors.name ? "border-red-400" : "border-gray-700"
              }`}
              placeholder="Jane Doe"
            />
            {errors.name && (
              <p className="text-red-300 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-3 py-2 rounded focus:outline-none focus:ring bg-gray-800 text-white placeholder-gray-400 border ${
                errors.email ? "border-red-400" : "border-gray-700"
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-300 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white placeholder-gray-400 border ${
                errors.password ? "border-red-400" : "border-gray-700"
              }`}
              placeholder="********"
            />
            {errors.password && (
              <p className="text-red-300 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent text-white placeholder-gray-400 border${
                errors.confirm ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="********"
            />
            {errors.confirm && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-500 transition text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error && (
            <p className="text-red-300 text-sm mt-2 text-center">{error}</p>
          )}

          <div className="text-center text-sm text-white">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
