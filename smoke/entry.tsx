// Smoke-test entry: renders the whole app into the jsdom document.
import React from "react";
import { createRoot } from "react-dom/client";
import App from "../src/App";

const root = document.getElementById("root")!;
createRoot(root).render(<App />);

// let effects + store settle before assertions run in the harness
(window as any).__SMOKE_READY = new Promise<void>((resolve) => {
  setTimeout(resolve, 250);
});
