import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const html = `<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body><div id="root"></div></body></html>`;
const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
const { window } = dom;

// Polyfill globals the app touches (navigator is read-only in newer Node)
globalThis.window = window;
globalThis.document = window.document;
try {
  Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
} catch {
  /* node already provides navigator */
}
globalThis.localStorage = window.localStorage;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.MutationObserver = window.MutationObserver;
globalThis.getComputedStyle = window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.scrollTo = () => {};

// The bundle may call crypto.randomUUID — node has it.
const bundle = process.argv[2];
await import(bundle);

await window.__SMOKE_READY;

const bodyText = document.body.textContent || "";
const checks = [
  ["brand name", bodyText.includes("Mahi") && bodyText.includes("Traders")],
  ["dashboard heading", bodyText.includes("ড্যাশবোর্ড") || bodyText.includes("Dashboard")],
  ["app title", bodyText.includes("তালি") || bodyText.includes("Khata")],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
if (failed > 0) process.exit(1);
console.log("SMOKE OK — rendered without errors");
