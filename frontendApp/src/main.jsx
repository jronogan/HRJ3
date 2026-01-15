import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
import ErrorComponent from "./ErrorComponent";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorComponent}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
