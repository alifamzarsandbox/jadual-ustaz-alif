import assert from "node:assert/strict";
import test from "node:test";
import { DAYS, ORIGINAL_LESSONS, SUBJECTS, TIMETABLE_REFERENCE } from "../src/data/timetable.ts";
import { duration, gridPlacement, lessonsForDay, minutes, periodTotal, sessionLocation, timeBoundaries, timeLabel, timeOfDay } from "../src/lib/timetable.ts";

test("daily counts agree with independently read source cells, not a lesson-card count", () => {
  const expected = { mon: [4, 6], tue: [5, 6], wed: [5, 6], thu: [4, 4], fri: [2, 3] };
  for (const day of DAYS) {
    const lessons = lessonsForDay(ORIGINAL_LESSONS, day.id);
    assert.deepEqual([lessons.length, periodTotal(lessons)], expected[day.id]);
  }
  assert.equal(ORIGINAL_LESSONS.length, 20);
  assert.equal(periodTotal(ORIGINAL_LESSONS), 25);
  assert.equal(periodTotal(ORIGINAL_LESSONS), TIMETABLE_REFERENCE.totalPeriods);
});

test("subject totals agree with the six totals printed in the source legend", () => {
  const expected = { ba: 6, aq: 6, ulum: 4, jawi: 2, tasmik: 6, assembly: 1 };
  for (const [subject, count] of Object.entries(expected)) {
    assert.equal(periodTotal(ORIGINAL_LESSONS.filter((lesson) => lesson.subject === subject)), count, subject);
    assert.equal(TIMETABLE_REFERENCE.subjectPeriods[subject], count);
  }
});

test("records have stable unique IDs, valid local times and no daily overlap", () => {
  assert.equal(new Set(ORIGINAL_LESSONS.map((lesson) => lesson.id)).size, ORIGINAL_LESSONS.length);
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  for (const lesson of ORIGINAL_LESSONS) {
    assert.ok(SUBJECTS[lesson.subject]);
    assert.ok(DAYS.some((day) => day.id === lesson.day));
    assert.match(lesson.start, timePattern);
    assert.match(lesson.end, timePattern);
    assert.ok(duration(lesson) > 0);
    assert.ok(Number.isInteger(lesson.periods) && lesson.periods > 0);
    assert.ok(minutes(lesson.start) >= minutes("13:10"));
    assert.ok(minutes(lesson.end) <= minutes("18:30"));
  }
  for (const day of DAYS) {
    const daily = lessonsForDay(ORIGINAL_LESSONS, day.id);
    daily.slice(1).forEach((lesson, index) => assert.ok(minutes(lesson.start) >= minutes(daily[index].end), lesson.id));
  }
});

test("merged cells preserve printed periods without double-counting duplicate column headings", () => {
  const merged = ORIGINAL_LESSONS.filter((lesson) => lesson.periods > 1);
  assert.deepEqual(merged.map((lesson) => [lesson.id, lesson.sourcePeriods]), [
    ["oct26-mon-aq-1g", [2, 3]],
    ["oct26-mon-aq-3a", [10, 11]],
    ["oct26-tue-ulum-3a", [1, 2]],
    ["oct26-wed-ba-3a", [8, 9]],
    ["oct26-fri-ulum-1g", [3, 4]],
  ]);
  for (const day of DAYS) {
    const periods = lessonsForDay(ORIGINAL_LESSONS, day.id).flatMap((lesson) => {
      assert.equal(lesson.sourcePeriods.length, lesson.periods);
      return lesson.sourcePeriods;
    });
    assert.equal(new Set(periods).size, periods.length, day.name);
  }
  for (const lesson of merged) assert.equal(duration(lesson), 60);
});

test("Dewan is a venue; only 1G, 3A and 2B are class labels", () => {
  assert.deepEqual([...new Set(ORIGINAL_LESSONS.map((lesson) => lesson.className).filter(Boolean))].sort(), ["1G", "2B", "3A"]);
  const assembly = ORIGINAL_LESSONS.find((lesson) => lesson.subject === "assembly");
  assert.equal(assembly.className, "");
  assert.equal(sessionLocation(assembly), "Dewan");
});

test("desktop grid uses exact off-hour boundaries and retains true duration ratios", () => {
  const boundaries = timeBoundaries(ORIGINAL_LESSONS);
  assert.equal(boundaries[0], minutes("13:10"));
  assert.equal(boundaries.at(-1), minutes("18:30"));
  assert.ok(boundaries.includes(minutes("15:30")));
  for (const lesson of ORIGINAL_LESSONS) {
    const { startRow, endRow } = gridPlacement(lesson, boundaries);
    assert.ok(Number.isInteger(startRow) && Number.isInteger(endRow));
    assert.ok(startRow >= 2 && endRow > startRow);
    assert.equal(boundaries[endRow - 2] - boundaries[startRow - 2], duration(lesson));
  }
});

test("afternoon labels do not retain the old demo morning suffix", () => {
  assert.equal(timeLabel("13:10"), "1:10");
  assert.equal(timeLabel("18:30"), "6:30");
  for (const lesson of ORIGINAL_LESSONS) assert.equal(timeOfDay(lesson.start), "petang");
});

test("user-confirmed BA 1G period-six sessions run 15:30–16:00 without pending flags", () => {
  const ids = ["oct26-wed-ba-1g", "oct26-thu-ba-1g-p6"];
  for (const id of ids) {
    const lesson = ORIGINAL_LESSONS.find((item) => item.id === id);
    assert.ok(lesson, id);
    assert.equal(lesson.subject, "ba");
    assert.equal(lesson.className, "1G");
    assert.equal(lesson.start, "15:30");
    assert.equal(lesson.end, "16:00");
    assert.equal(duration(lesson), 30);
    assert.equal(lesson.periods, 1);
  }
  assert.deepEqual(ORIGINAL_LESSONS.filter((lesson) => lesson.timeNote), []);
});
