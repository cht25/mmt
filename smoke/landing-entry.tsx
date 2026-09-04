// Smoke-test entry: renders the landing page (no CSS import, esbuild-friendly).
import React from "react";
import { createRoot } from "react-dom/client";
import Landing from "../src/landing/Landing";

const root = document.getElementById("root")!;
createRoot(root).render(<Landing />);

(window as any).__SMOKE_READY = new Promise<void>((resolve) => {
  setTimeout(resolve, 300);
});
