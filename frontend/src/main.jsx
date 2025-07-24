import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import ShopContextProvider from "./context/ShowContext.jsx";

createRoot(document.getElementById("root")).render(
  <ShopContextProvider>
    <Router>
      <App />
    </Router>
  </ShopContextProvider>
);
