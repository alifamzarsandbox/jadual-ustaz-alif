import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const base = "/jadual-ustaz-alif/";
const prefix = "jadual-ustaz-alif-precache-";
const current = `${prefix}new`;
const origin = "https://example.test";
const template = await readFile(new URL("../scripts/sw-template.js", import.meta.url), "utf8");
function worker({ failInstall = false, windows = [] } = {}) {
  const handlers = new Map();
  const entries = new Map([[base, new Response("offline shell")]]);
  const deleted = [], messages = [];
  let skipped = 0, claimed = 0;
  const cache = {
    match: async (request) => entries.get(typeof request === "string" ? request : new URL(request.url).pathname),
    addAll: async () => { if (failInstall) throw new Error("network unavailable"); },
  };
  vm.runInNewContext(template, {
    APP_BASE: base, CACHE_PREFIX: prefix, CACHE_NAME: current, PRECACHE: [base],
    URL, Response, Request: class { constructor(url) { this.url = origin + url; } },
    fetch: async () => { throw new Error("offline"); },
    caches: { open: async () => cache, keys: async () => [`${prefix}old`, current, "other-app"], delete: async (key) => deleted.push(key) },
    self: { location: { origin }, addEventListener: (name, fn) => handlers.set(name, fn), skipWaiting: async () => skipped++, clients: { claim: async () => claimed++, matchAll: async () => windows } },
  });
  async function dispatch(name, properties = {}) {
    const pending = [];
    let response;
    handlers.get(name)({ source: { postMessage: (message) => messages.push(message) }, waitUntil: (promise) => pending.push(promise), respondWith: (promise) => { response = promise; }, ...properties });
    await Promise.all(pending);
    return response;
  }
  return { dispatch, deleted, messages, entries, skipped: () => skipped, claimed: () => claimed };
}

test("offline shell works with a query string; missing assets fail explicitly and other apps are untouched", async () => {
  const w = worker();
  const response = await w.dispatch("fetch", { request: { url: `${origin}${base}?from=home`, method: "GET", mode: "navigate" } });
  assert.equal(await response.text(), "offline shell");
  const absent = await w.dispatch("fetch", { request: { url: `${origin}${base}absent.js`, method: "GET" } });
  assert.equal(absent.status, 503);
  assert.equal(await w.dispatch("fetch", { request: { url: `${origin}/other-app/`, method: "GET" } }), undefined);
  assert.equal(await w.dispatch("fetch", { request: { url: `${origin}${base}`, method: "POST" } }), undefined);
});

test("failed precache installation retains the prior app cache", async () => {
  const w = worker({ failInstall: true });
  await assert.rejects(w.dispatch("install"), /network unavailable/);
  assert.deepEqual(w.deleted, [current]);
  assert.equal(w.skipped(), 0);
});

test("activation cleans only this app's obsolete cache", async () => {
  const w = worker();
  await w.dispatch("activate");
  assert.deepEqual(w.deleted, [`${prefix}old`]);
  assert.equal(w.claimed(), 1);
});

test("explicit update waits until other app tabs close", async () => {
  const windows = [{ url: origin + base }, { url: origin + base + "?second" }];
  const w = worker({ windows });
  await w.dispatch("message", { data: { type: "SKIP_WAITING" } });
  assert.equal(w.skipped(), 0);
  assert.equal(w.messages[0].type, "UPDATE_BLOCKED");
  windows.pop();
  windows.push({ url: origin + "/other-app/" });
  await w.dispatch("message", { data: { type: "SKIP_WAITING" } });
  assert.equal(w.skipped(), 1);
});

test("cache readiness becomes false if the browser evicts an essential asset", async () => {
  const w = worker();
  await w.dispatch("message", { data: { type: "CACHE_STATUS" } });
  assert.equal(w.messages[0].ready, true);
  w.entries.clear();
  await w.dispatch("message", { data: { type: "CACHE_STATUS" } });
  assert.equal(w.messages[1].ready, false);
});
