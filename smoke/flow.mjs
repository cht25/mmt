import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const html = `<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body><div id="root"></div></body></html>`;
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

// React's scheduler posts through MessageChannel; shim it so flushes reliably
// run in Node (jsdom's channel can be inert in this headless setup).
globalThis.MessageChannel = class {
  constructor() {
    this.port1 = { onmessage: null, postMessage: () => {} };
    this.port2 = { onmessage: null, postMessage: () => {} };
    this.port1.postMessage = (data) => {
      setTimeout(() => this.port1.onmessage && this.port1.onmessage({ data }), 0);
    };
    this.port2.postMessage = (data) => {
      setTimeout(() => this.port2.onmessage && this.port2.onmessage({ data }), 0);
    };
  }
};
window.MessageChannel = globalThis.MessageChannel;

const bundle = process.argv[2];
await import(bundle);
await window.__SMOKE_READY;

const doc = window.document;
const sleep = (ms = 60) => new Promise((r) => setTimeout(r, ms));

function buttons() {
  return [...doc.querySelectorAll("button")];
}
function clickText(text, last = false) {
  const all = buttons().filter((b) => (b.textContent || "").includes(text));
  const el = last ? all[all.length - 1] : all[0];
  if (!el) throw new Error(`button not found: ${text}`);
  el.click();
  return el;
}
function setInput(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, value);
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
}
function setSelect(select, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(select, value);
  select.dispatchEvent(new window.Event("change", { bubbles: true }));
}

let failed = 0;
function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed++;
}
async function waitFor(text, ms = 1200) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if ((doc.body.textContent || "").includes(text)) return true;
    await sleep(50);
  }
  return (doc.body.textContent || "").includes(text);
}

// ---- Flow A: add a customer from the empty dashboard ----
clickText("নতুন গ্রাহক");
await sleep();
const nameInput = doc.querySelector('input[placeholder*="রফিকুল"]');
if (!nameInput) throw new Error("customer name input not found");
setInput(nameInput, "টেস্ট গ্রাহক");
const phoneInput = doc.querySelector('input[placeholder*="017XX"]');
setInput(phoneInput, "01911-000000");
clickText("সেভ করুন");
await sleep(250);
// Dashboard leaves its empty state once the customer exists (a zero-balance new
// customer is not yet listed in "top dues", so check for the empty state itself).
check("customer was added", await waitFor("মোট পাওনা", 400) && !(doc.body.textContent || "").includes("এখনও কোনো গ্রাহক যোগ করা হয়নি"));

// ---- Flow B: record a credit sale ----
clickText("নতুন লেনদেন");
await sleep();
// type buttons: click "বিক্রি / দেনা" (default already selected, still click)
clickText("বিক্রি / দেনা");
await sleep();
const amountInput = doc.querySelector('input[inputmode="decimal"]');
setInput(amountInput, "1200");
clickText("সেভ করুন");
await sleep();
const bodyText = doc.body.textContent || "";
check("sale appears in dashboard", bodyText.includes("1,200"));
check("top dues shows tester", bodyText.includes("টেস্ট গ্রাহক"));

// ---- Flow C: open the khata ledger of the new customer ----
clickText("গ্রাহক ও পার্টি");
await sleep();
clickText("খাতা দেখুন");
await sleep();
check("ledger shows entry", (doc.body.textContent || "").includes("1,200"));
check("ledger title", (doc.body.textContent || "").includes("টেস্ট গ্রাহক"));

// ---- Flow D: settings -> load demo data ----
clickText("সেটিংস");
await sleep();
check("admin panel visible", await waitFor("অ্যাডমিন প্যানেল"));
check("payment gateways visible", await waitFor("পেমেন্ট গেটওয়ে") && (doc.body.textContent || "").includes("bKash"));

// ---- Flow D2: admin adds a new gateway ----
clickText("গেটওয়ে যোগ করুন");
await sleep(150);
const gwName = doc.querySelector('input[placeholder*="bKash / Nagad"]');
if (gwName) {
  setInput(gwName, "সিটি ব্যাংক");
  clickText("সেভ করুন", true); // last save button = gateway modal (profile save comes earlier in DOM)
  await sleep(200);
  check("gateway added", await waitFor("সিটি ব্যাংক"));
} else {
  check("gateway added", false);
}

clickText("ডেমো ডেটা লোড করুন");
await sleep(180);
clickText("ড্যাশবোর্ড");
await sleep(180);
check("demo data loaded", (doc.body.textContent || "").includes("রফিকুল ইসলাম"));

// ---- Flow E: switch language to English ----
clickText("সেটিংস");
await sleep(120);
const themeToggle = buttons().find((b) => (b.textContent || "").includes("ভাষা"));
if (!themeToggle) throw new Error("language toggle not found");
themeToggle.click();
await sleep(200);
check("english labels appear", (doc.body.textContent || "").includes("Dashboard"));

// ---- Flow F: transactions page renders with entries ----
clickText("Transactions");
await sleep();
check("transactions list renders", (doc.body.textContent || "").includes("Rofiqul") || (doc.body.textContent || "").includes("রফিকুল"));

if (failed > 0) {
  console.error(`\n${failed} check(s) FAILED`);
  process.exit(1);
}
console.log("\nALL SMOKE CHECKS PASSED");
process.exit(0);
