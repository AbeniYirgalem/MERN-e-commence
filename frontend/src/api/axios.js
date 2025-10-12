import axios from "axios";

// Prefer Vite env (if available) or CRA-style REACT_APP_API_URL.
// This avoids accessing Node-only env vars in the browser.
const apiBase =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_URL) ||
  "http://localhost:5000";

const instance = axios.create({
  baseURL: apiBase,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to set or remove Authorization header when token changes
export const setAuthToken = (token) => {
  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete instance.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Initialize from localStorage if available
if (localStorage.getItem("token")) {
  instance.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${localStorage.getItem("token")}`;
}

export default instance;
