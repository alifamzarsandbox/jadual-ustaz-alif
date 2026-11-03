import assert from "node:assert/strict";
import test from "node:test";
import { ORIGINAL_LESSONS } from "../src/data/timetable.ts";
import { currentSchedule, lessonProgress, malaysiaTime } from "../src/lib/clock.ts";
import { dueReminders, readReminderKeys } from "../src/lib/reminders.ts";
import { exportTimetable, parseImport, validateLessons } from "../src/lib/validation.ts";
import { defaultPlanner, decodePlanner, loadPlanner, savePlanner, STORAGE_KEY } from "../src/lib/storage.ts";

const at = (time, date = "2026-11-02") => Date.parse(`${date}T${time}+08:00`);
const lesson = (changes = {}) => ({ id: "test-one", day: "mon", subject: "ba", className: "1G", start: "13:10", end: "13:40", periods: 1, ...changes });

test("Malaysia date crosses midnight independently of the UTC date", () => {
  assert.deepEqual(malaysiaTime(Date.parse("2026-11-01T16:00:00Z")), { dateKey: "2026-11-02", day: "mon", minute: 0 });
  assert.equal(malaysiaTime(at("12:00:00", "2026-11-07")).day, null);
  assert.equal(malaysiaTime(at("12:00:00", "2026-11-08")).day, null);
});

test("current lesson boundaries, next class, gaps, completed days and weekends", () => {
  const before = currentSchedule(ORIGINAL_LESSONS, at("13:09:59"));
  assert.equal(before.current, undefined);
  assert.equal(before.next.subject, "assembly");
  assert.equal(currentSchedule(ORIGINAL_LESSONS, at("13:10:00")).current.subject, "assembly");
  assert.equal(currentSchedule(ORIGINAL_LESSONS, at("13:40:00")).current.id, "oct26-mon-aq-1g");
  const gap = currentSchedule(ORIGINAL_LESSONS, at("15:10:00"));
  assert.equal(gap.current, undefined);
  assert.equal(gap.next.start, "17:30");
  assert.equal(currentSchedule(ORIGINAL_LESSONS, at("18:30:00")).next, undefined);
  assert.equal(currentSchedule(ORIGINAL_LESSONS, at("15:00:00", "2026-11-07")).daily.length, 0);
  assert.equal(currentSchedule([], at("13:15:00")).daily.length, 0);
  assert.deepEqual(lessonProgress(lesson(), 13 * 60 + 25), { elapsed: 15, remaining: 15, percent: 50 });
});

test("reminders fire once at 5/10/15 minutes and never when turned off", () => {
  for (const lead of [5, 10, 15]) {
    const now = at("13:10:00") - lead * 60_000;
    const due = dueReminders([lesson()], lead, now, new Set());
    assert.equal(due.length, 1);
    assert.equal(due[0].remaining, lead);
    assert.equal(dueReminders([lesson()], lead, now + 15_000, new Set([due[0].key])).length, 0);
  }
  assert.equal(dueReminders([lesson()], 0, at("13:00:00"), new Set()).length, 0);
});

test("missed reminders do not flood on focus, and no reminder arrives after class starts", () => {
  assert.equal(dueReminders([lesson()], 10, at("12:59:59"), new Set()).length, 0);
  assert.equal(dueReminders([lesson()], 10, at("13:01:30"), new Set()).length, 1);
  assert.equal(dueReminders([lesson()], 10, at("13:01:31"), new Set()).length, 0);
  assert.equal(dueReminders([lesson()], 10, at("13:10:00"), new Set()).length, 0);
});

test("duplicate keys survive timing edits and settings changes, but reset on a new date", () => {
  const key = dueReminders([lesson()], 10, at("13:00:00"), new Set())[0].key;
  assert.equal(dueReminders([lesson({ start: "13:15", end: "13:45" })], 15, at("13:00:00"), new Set([key])).length, 0);
  assert.equal(dueReminders([lesson()], 10, at("13:00:00", "2026-11-09"), new Set([key])).length, 1);
});

test("midnight reminder considers the next Malaysia date; ordinary weekends remain quiet", () => {
  const early = lesson({ start: "00:05", end: "00:35" });
  const due = dueReminders([early], 10, at("23:55:00", "2026-11-01"), new Set());
  assert.equal(due[0].key, "2026-11-02:test-one");
  assert.equal(dueReminders(ORIGINAL_LESSONS, 10, at("13:00:00", "2026-11-07"), new Set()).length, 0);
});

test("reminder storage tolerates invalid data and prunes obsolete dates", () => {
  assert.equal(readReminderKeys("broken", at("13:00:00")).size, 0);
  const keys = readReminderKeys(JSON.stringify(["2020-01-01:old", "2026-11-02:test-one", 1, "invalid"]), at("13:00:00"));
  assert.deepEqual([...keys], ["2026-11-02:test-one"]);
});

test("editor rejects invalid inputs and overlapping lessons, allowing adjacent periods", () => {
  assert.throws(() => validateLessons([lesson({ end: "13:00" })]), /masa tamat/);
  assert.throws(() => validateLessons([lesson({ start: "25:10" })]), /masa tamat/);
  assert.throws(() => validateLessons([lesson({ periods: 1.5 })]), /bilangan waktu/);
  assert.throws(() => validateLessons([lesson({ className: "  " })]), /kelas diperlukan/);
  assert.throws(() => validateLessons([lesson({ subject: "__proto__" })]), /subjek/);
  assert.throws(() => validateLessons([lesson(), lesson()]), /ID/);
  assert.throws(() => validateLessons([lesson(), lesson({ id: "two", start: "13:30", end: "14:00" })]), /bertindih/);
  assert.equal(validateLessons([lesson(), lesson({ id: "two", start: "13:40", end: "14:00" })]).length, 2);
  assert.equal(validateLessons([lesson(), lesson({ id: "two", day: "tue" })]).length, 2);
});

test("imports require valid version and bounded records; exports round trip including an empty timetable", () => {
  assert.deepEqual(parseImport(exportTimetable(ORIGINAL_LESSONS)), validateLessons(ORIGINAL_LESSONS));
  assert.deepEqual(parseImport(exportTimetable([])), []);
  assert.throws(() => parseImport("{oops}"), /JSON/);
  assert.throws(() => parseImport('{"version":2,"lessons":[]}'), /Format/);
  assert.throws(() => parseImport("x".repeat(1_000_001)), /besar/);
  assert.throws(() => validateLessons(Array(201).fill(lesson())), /200/);
  const clean = validateLessons([{ ...lesson(), unexpected: "ignored", timeNote: "untrusted" }])[0];
  assert.equal(clean.unexpected, undefined);
  assert.equal(clean.timeNote, undefined);
});

test("all preferences and custom/empty timetables survive persistence", () => {
  const data = defaultPlanner();
  data.lessons = [];
  data.preferences = { theme: "dark", reminderMinutes: 0, browserNotifications: true, reducedMotion: true };
  let stored;
  const storage = { getItem: () => stored ?? null, setItem: (_, value) => { stored = value; } };
  assert.equal(savePlanner(storage, data), undefined);
  assert.deepEqual(loadPlanner(storage).data, data);
  assert.throws(() => decodePlanner(JSON.stringify({ ...data, preferences: { ...data.preferences, reminderMinutes: 42 } })));
});

test("blocked/corrupt localStorage falls back safely without overwriting user data", () => {
  let writes = 0;
  const storage = { getItem: (key) => { assert.equal(key, STORAGE_KEY); return "corrupt"; }, setItem: () => { writes++; } };
  assert.ok(loadPlanner(storage).error);
  assert.equal(writes, 0);
  assert.equal(loadPlanner(storage).data.lessons.length, 20);
  assert.ok(savePlanner({ ...storage, setItem: () => { throw new Error("QuotaExceededError"); } }, defaultPlanner()));
  assert.ok(loadPlanner({ ...storage, getItem: () => { throw new Error("SecurityError"); } }).error);
});
