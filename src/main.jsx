import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* reducedMotion="user" makes every animation defer to the OS preference */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
);
