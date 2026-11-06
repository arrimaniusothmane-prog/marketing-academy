import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME_PATH || (process.platform === "darwin"
  ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  : "google-chrome");
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PORT = 9333;
const USER_DIR = "/tmp/sdm13-chrome-check";
const BASE = `file://${ROOT}`;

fs.rmSync(USER_DIR, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DIR}`,
  "--allow-file-access-from-files",
  "about:blank"
], { stdio: ["ignore", "ignore", "ignore"] });

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForChrome() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return await res.json();
    } catch (e) { /* retry */ }
    await sleep(150);
  }
  throw new Error("Chrome did not start");
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text + " " + (result.exceptionDetails.exception?.description || ""));
    }
    return result.result.value;
  }
}

async function openPage() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
  const target = await res.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Network.enable");
  return { cdp, target, ws };
}

async function navigate(cdp, url) {
  cdp.events.length = 0;
  await cdp.send("Page.navigate", { url });
  const start = Date.now();
  while (Date.now() - start < 15000) {
    if (cdp.events.some((e) => e.method === "Page.loadEventFired")) break;
    await sleep(100);
  }
  await sleep(700);
}

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function main() {
  await waitForChrome();
  const { cdp } = await openPage();
  const errors = [];
  cdp.ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === "Runtime.exceptionThrown") {
      errors.push(msg.params.exceptionDetails.text + " " + (msg.params.exceptionDetails.exception?.description || ""));
    }
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      errors.push(msg.params.entry.text);
    }
    if (msg.method === "Network.loadingFailed" && !msg.params.errorText.includes("ERR_ABORTED")) {
      errors.push("Network: " + msg.params.errorText + " " + (msg.params.requestId || ""));
    }
  });

  const pages = [
    ["home", `${BASE}/index.html`],
    ["training", `${BASE}/training.html`],
    ["module-01", `${BASE}/modules/module-01.html`],
    ["module-03", `${BASE}/modules/module-03.html`],
    ["lesson-01", `${BASE}/lessons/module-01/lesson-01.html`],
    ["lesson-m3-13", `${BASE}/lessons/module-03/lesson-13.html`],
    ["lesson-m4-12", `${BASE}/lessons/module-04/lesson-12.html`],
    ["search", `${BASE}/search.html`],
    ["contact", `${BASE}/contact.html`]
  ];

  for (const [name, url] of pages) {
    await navigate(cdp, url);
    const info = await cdp.evaluate(`(async () => {
      await document.fonts.ready;
      const body = document.body;
      const fonts = {
        cairo: document.fonts.check('16px Cairo'),
        tajawal: document.fonts.check('700 16px Tajawal'),
        h1: getComputedStyle(document.querySelector('h1')).fontFamily
      };
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href')).filter(href => href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:'));
      return {
        title: document.title,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        overflow,
        fonts,
        navCurrent: document.querySelectorAll('nav a[aria-current="page"]').length,
        h1: document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : '',
        links,
        quizCount: document.querySelectorAll('.quiz').length,
        lessonCount: document.querySelectorAll('.lesson-row').length
      };
    })()`);
    check(`${name}: lang/dir`, info.lang === "ar" && info.dir === "rtl", `${info.lang}/${info.dir}`);
    check(`${name}: no horizontal overflow`, info.overflow <= 1, `overflow=${info.overflow}px`);
    check(`${name}: local fonts`, info.fonts.cairo && info.fonts.tajawal && info.fonts.h1.includes("Tajawal"), JSON.stringify(info.fonts));
    check(`${name}: single h1`, Boolean(info.h1), info.h1.slice(0, 40));
    const missing = [];
    for (const href of info.links) {
      const resolved = new URL(href, url);
      if (resolved.protocol !== "file:") continue;
      if (resolved.pathname.includes("/public/pdfs/")) continue; // generated later
      if (!fs.existsSync(resolved.pathname)) missing.push(href);
    }
    if (missing.length) check(`${name}: internal links exist`, false, [...new Set(missing)].slice(0, 5).join(", "));
    else check(`${name}: internal links exist`, true);
  }

  // Lesson interactions
  await navigate(cdp, `${BASE}/lessons/module-01/lesson-01.html`);
  let interaction = await cdp.evaluate(`(() => {
    const btn = document.querySelector('[data-done-lesson]');
    btn.click();
    const pressed = btn.getAttribute('aria-pressed');
    const stored = localStorage.getItem('sdm13:done:m1l1');
    const firstQ = document.querySelector('.quiz-q');
    const correct = firstQ.querySelector('.quiz-option[data-correct="true"]');
    correct.click();
    const feedback = firstQ.querySelector('.quiz-feedback').classList.contains('is-visible');
    const score = document.querySelector('[data-quiz-score]').textContent;
    return { pressed, stored, feedback, score, toc: document.querySelectorAll('.lesson-toc a[href^="#"]').length, sections: document.querySelectorAll('.lesson-section').length };
  })()`);
  check("lesson: completion toggles + persists", interaction.pressed === "true" && interaction.stored === "1", JSON.stringify(interaction));
  check("lesson: quiz feedback + score", interaction.feedback && interaction.score.includes("1"), interaction.score);
  check("lesson: 12 sections + TOC", interaction.sections === 12 && interaction.toc === 12, `sections=${interaction.sections}, toc=${interaction.toc}`);

  // Module progress reflects completed lesson
  await navigate(cdp, `${BASE}/modules/module-01.html`);
  const progress = await cdp.evaluate(`(() => ({
    label: document.querySelector('[data-progress-label]')?.textContent,
    width: document.querySelector('[data-progress-module="m1"] i')?.style.width,
    doneRows: document.querySelectorAll('.lesson-row.is-done').length
  }))()`);
  check("module: progress reflects local completion", progress.doneRows >= 1 && progress.label.includes("1 /"), JSON.stringify(progress));

  // Search interaction
  await navigate(cdp, `${BASE}/search.html`);
  const search = await cdp.evaluate(`(() => {
    const input = document.querySelector('#search-input');
    input.value = 'المنتج';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const first = document.querySelectorAll('.search-result').length;
    const chip = document.querySelector('[data-search-filter="m3"]');
    chip.click();
    const filtered = document.querySelectorAll('.search-result').length;
    const status = document.querySelector('#search-status').textContent;
    return { first, filtered, status };
  })()`);
  check("search: query returns results", search.first > 0, `${search.first} results`);
  check("search: module filter works", search.filtered > 0 && search.filtered <= search.first, `${search.filtered} filtered`);

  // Contact validation + WhatsApp handoff
  await navigate(cdp, `${BASE}/contact.html`);
  const contact = await cdp.evaluate(`(() => {
    const form = document.querySelector('#contact-form');
    const invalidBefore = document.querySelectorAll('.field.has-error').length;
    form.querySelector('button[type="submit"]').click();
    const invalidAfter = document.querySelectorAll('.field.has-error').length;
    const statusAfterInvalid = document.querySelector('#form-status').className;
    document.querySelector('#field-name').value = 'اختبار';
    document.querySelector('#field-contact').value = '0612345678';
    document.querySelector('#field-message').value = 'هذه رسالة اختبار للتحقق من النموذج.';
    let opened = '';
    const original = window.open;
    window.open = (url) => { opened = url; return {}; };
    form.querySelector('button[type="submit"]').click();
    window.open = original;
    const statusAfterValid = document.querySelector('#form-status').className;
    return { invalidBefore, invalidAfter, statusAfterInvalid, opened, statusAfterValid };
  })()`);
  check("contact: empty submit shows errors", contact.invalidAfter >= 2, `errors=${contact.invalidAfter}`);
  check("contact: valid submit builds WhatsApp link", contact.opened.startsWith("https://wa.me/212706868909?text="), contact.opened.slice(0, 60));
  check("contact: success status shown", contact.statusAfterValid.includes("is-success"), contact.statusAfterValid);

  console.log("\nConsole/network errors:", errors.length);
  for (const e of errors.slice(0, 12)) console.log("  -", e);
  const failures = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failures.length}/${results.length} checks passed.`);
  if (failures.length || errors.length) process.exitCode = 1;

  chrome.kill("SIGTERM");
  await sleep(400);
}

main().catch((error) => {
  console.error(error);
  chrome.kill("SIGTERM");
  process.exit(1);
});
