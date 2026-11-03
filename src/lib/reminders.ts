import type { Lesson } from "../types/timetable";
import type { ReminderMinutes } from "../types/planner";
import { lessonEpoch, malaysiaTime } from "./clock.ts";

export const REMINDER_KEY = "jadual-ustaz-alif:reminders:v1";
export const REMINDER_GRACE_MS = 90_000;
export interface DueReminder { key: string; lesson: Lesson; remaining: number }

export function dueReminders(lessons: Lesson[], lead: ReminderMinutes, now: number, seen: ReadonlySet<string>): DueReminder[] {
  if (!lead) return [];
  const today = malaysiaTime(now).dateKey;
  const tomorrow = malaysiaTime(now + 86_400_000).dateKey;
  const due: DueReminder[] = [];
  // Tomorrow is included so a 00:05 Monday class can remind on Sunday at 23:55.
  for (const dateKey of [today, tomorrow]) {
    const day = malaysiaTime(lessonEpoch(dateKey, "12:00")).day;
    if (!day) continue;
    for (const lesson of lessons) {
      if (lesson.day !== day) continue;
      const start = lessonEpoch(dateKey, lesson.start);
      const dueAt = start - lead * 60_000;
      const key = `${dateKey}:${lesson.id}`;
      if (!seen.has(key) && now >= dueAt && now < start && now - dueAt <= REMINDER_GRACE_MS) {
        due.push({ key, lesson, remaining: Math.ceil((start - now) / 60_000) });
      }
    }
  }
  return due;
}

export function readReminderKeys(raw: string | null, now: number): Set<string> {
  try {
    const values: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(values)) return new Set();
    const oldest = malaysiaTime(now - 86_400_000).dateKey;
    const newest = malaysiaTime(now + 86_400_000).dateKey;
    return new Set(values.filter((key): key is string => typeof key === "string" && /^\d{4}-\d{2}-\d{2}:[a-zA-Z0-9_-]{1,100}$/.test(key) && key.slice(0, 10) >= oldest && key.slice(0, 10) <= newest).slice(-600));
  } catch { return new Set(); }
}
