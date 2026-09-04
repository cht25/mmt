import { JSDOM } from "jsdom";
import { readFileSync, existsSync, statSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
const { window } = dom;

globalThis.window = window;
globalThis.document = window.document;
try {
  Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });
} catch {}
globalThis.localStorage = window.localStorage;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Element = window.Element;
globalThis.Node = window.Node;
globalThis.MutationObserver = window.MutationObserver;
globalThis.getComputedStyle = window.getComputedStyle;
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.scrollTo = () => {};
window.print = () => {};
window.alert = () => {};
window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.MessageChannel = class {
  constructor() {
    this.port1 = { onmessage: null, postMessage: () => {} };
    this.port2 = { onmessage: null, postMessage: () => {} };
    this.port1.postMessage = (data) => setTimeout(() => this.port1.onmessage && this.port1.onmessage({ data }), 0);
    this.port2.postMessage = (data) => setTimeout(() => this.port2.onmessage && this.port2.onmessage({ data }), 0);
  }
};
window.MessageChannel = globalThis.MessageChannel;

const bundle = process.argv[2];
await import(bundle);
await window.__SMOKE_READY;

const text = window.document.body.textContent || "";
const pwaFiles = process.argv[3] ? JSON.parse(process.argv[3]) : null;

let failed = 0;
function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}

check("hero brand", text.includes("Mahi And Muhi Traders"));
check("hero headline", text.includes("এক খাতায়"));
check("open app CTA", text.includes("এখনই খাতা খুলুন"));
check("install button", text.includes("অ্যাপ ইনস্টল"));
check("features section", text.includes("মূল ফিচারগুলো") && text.includes("গ্রাহকের খাতা"));
check("install steps", text.includes("Android / Chrome") && text.includes("iPhone / iPad"));
check("payment methods section", text.includes("পেমেন্ট মাধ্যম") && text.includes("bKash"));
check("footer", text.includes("PWA") || text.includes("তালি খাতা"));

if (pwaFiles) {
  check("manifest exists", existsSync(pwaFiles.manifest) && statSync(pwaFiles.manifest).size > 100);
  check("service worker exists", existsSync(pwaFiles.sw) && statSync(pwaFiles.sw).size > 200);
  check("app.html exists", existsSync(pwaFiles.appHtml));
  const appHtml = readFileSync(pwaFiles.appHtml, "utf8");
  check("app.html is PWA-linked", appHtml.includes("manifest.webmanifest") && appHtml.includes("apple-touch-icon"));
}

if (failed > 0) {
  console.error(`\n${failed} check(s) FAILED`);
  process.exit(1);
}
console.log("\nLANDING SMOKE PASSED");
process.exit(0);
