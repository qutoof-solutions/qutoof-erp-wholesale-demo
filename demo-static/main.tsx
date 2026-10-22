import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErpDemoApp } from "../components/erp-demo/erp-demo-app";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing root element for Qutoof ERP demo.");

createRoot(rootElement).render(
  <StrictMode>
    <ErpDemoApp />
  </StrictMode>,
);
