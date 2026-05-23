import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";

// Root Element Initialization
const root = ReactDOM.createRoot(document.getElementById("root"));

// React Application Rendering
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);