import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./app/App.jsx";   // <-- dit is de belangrijke lijn

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);