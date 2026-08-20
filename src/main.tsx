import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./design-system.css";
import "./App.css";
import "./section04.css";
import "./features.css";
import "./stats.css";
import "./testimonials.css";
import "./final-section.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
