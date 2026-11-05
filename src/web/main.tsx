import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ProgressPage } from "./ProgressPage";
import "./styles.css";

const isProgressPage = window.location.pathname.replace(/\/$/, "") === "/progress";

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isProgressPage ? <ProgressPage /> : <App />}</StrictMode>,
);
