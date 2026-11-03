import type { Day, Lesson } from "../types/timetable";
import { lessonsForDay, minutes } from "./timetable.ts";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit",
  weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});
const weekdays: Record<string, Day | null> = { Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: null, Sun: null };

export function malaysiaTime(epoch: number) {
  const parts = Object.fromEntries(formatter.formatToParts(epoch).map((part) => [part.type, part.value]));
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    day: weekdays[parts.weekday],
    minute: Number(parts.hour) * 60 + Number(parts.minute) + Number(parts.second) / 60,
  };
}

export function lessonEpoch(dateKey: string, time: string) {
  return Date.parse(`${dateKey}T${time}:00+08:00`);
}

export function currentSchedule(lessons: Lesson[], epoch: number) {
  const local = malaysiaTime(epoch);
  const daily = local.day ? lessonsForDay(lessons, local.day) : [];
  const current = daily.find((lesson) => minutes(lesson.start) <= local.minute && local.minute < minutes(lesson.end));
  const next = daily.find((lesson) => minutes(lesson.start) > local.minute);
  return { ...local, daily, current, next };
}

export function lessonProgress(lesson: Lesson, minute: number) {
  const elapsed = Math.max(0, Math.min(minute - minutes(lesson.start), minutes(lesson.end) - minutes(lesson.start)));
  const remaining = Math.max(0, minutes(lesson.end) - Math.max(minute, minutes(lesson.start)));
  return { elapsed: Math.floor(elapsed), remaining: Math.ceil(remaining), percent: Math.round(elapsed / (minutes(lesson.end) - minutes(lesson.start)) * 100) };
}

export function countdown(minuteDifference: number) {
  const total = Math.max(0, Math.ceil(minuteDifference));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours ? `${hours} jam${mins ? ` ${mins} minit` : ""}` : `${mins} minit`;
}
