import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(logoutUser());
    toast.info("Logged out");
    const t = setTimeout(() => navigate("/"), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl">Logging out...</p>
      </div>
    </div>
  );
};

export default Logout;
