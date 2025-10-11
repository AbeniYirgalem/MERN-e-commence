import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`/api/auth/verify/${token}`);
        setMessage(res.data?.message || "Email verified");
        toast.success("Email verified");
        // Optionally redirect to login
        setTimeout(() => navigate("/login"), 1500);
      } catch (err) {
        const m = err.response?.data?.message || "Verification failed";
        setMessage(m);
        toast.error(m);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 mx-auto text-center text-white">
        {loading ? <p>Verifying...</p> : <p>{message}</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;
