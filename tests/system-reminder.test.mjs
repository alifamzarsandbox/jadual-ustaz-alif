import test from "node:test";
import assert from "node:assert/strict";
import { showSystemReminder } from "../src/lib/system-reminder.ts";

test("system delivery never starts without opt-in and permission", async () => {
  let lookups = 0;
  const lookup = async () => { lookups++; };
  await showSystemReminder(false, "Class", {}, { permission: "granted" }, lookup);
  await showSystemReminder(true, "Class", {}, { permission: "denied" }, lookup);
  await showSystemReminder(true, "Class", {}, { permission: "default" }, lookup);
  await showSystemReminder(true, "Class", {}, undefined, lookup);
  assert.equal(lookups, 0);
});

test("authorized reminders reach the worker or the browser constructor; failures are nonfatal", async () => {
  const calls = [];
  class BrowserNotice {
    static permission = "granted";
    constructor(...args) { calls.push(["browser", ...args]); }
  }
  const options = { body: "BA 1G", tag: "lesson-1" };
  await showSystemReminder(true, "Class", options, BrowserNotice, async () => ({
    showNotification: async (...args) => { calls.push(["worker", ...args]); },
  }));
  await showSystemReminder(true, "Class", options, BrowserNotice, async () => undefined);
  await showSystemReminder(true, "Class", options, BrowserNotice, async () => ({
    showNotification: async () => { throw new Error("OS unavailable"); },
  }));
  assert.deepEqual(calls, [["worker", "Class", options], ["browser", "Class", options]]);
});
