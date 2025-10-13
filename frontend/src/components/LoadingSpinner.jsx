import React from "react";

const LoadingSpinner = ({ size = 6 }) => {
  return (
    <div
      className={`w-${size} h-${size} animate-spin rounded-full border-4 border-t-indigo-600 border-gray-200`}
    ></div>
  );
};

export default LoadingSpinner;
