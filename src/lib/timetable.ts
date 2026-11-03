import type { Day, Lesson } from "@/types/timetable";

export function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

export function duration(lesson: Lesson) {
  return minutes(lesson.end) - minutes(lesson.start);
}

export function lessonsForDay(lessons: Lesson[], day: Day) {
  return lessons.filter((lesson) => lesson.day === day).sort((a, b) => minutes(a.start) - minutes(b.start));
}

export function periodTotal(lessons: Lesson[]) {
  return lessons.reduce((total, lesson) => total + lesson.periods, 0);
}

export function timeLabel(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(mins).padStart(2, "0")}`;
}

export function sessionLocation(lesson: Lesson) {
  return lesson.className || lesson.location || "—";
}

export function timeOfDay(time: string) {
  const hour = Number(time.slice(0, 2));
  return hour < 12 ? "pagi" : hour < 19 ? "petang" : "malam";
}

// Use exact event boundaries, not an assumed half-hour grid starting at :00.
// The school timetable starts at 13:10 and includes a 15:30 boundary.
export function timeBoundaries(lessons: Lesson[]) {
  return [...new Set(lessons.flatMap((lesson) => [minutes(lesson.start), minutes(lesson.end)]))].sort((a, b) => a - b);
}

export function gridPlacement(lesson: Lesson, boundaries: number[]) {
  return {
    startRow: boundaries.indexOf(minutes(lesson.start)) + 2,
    endRow: boundaries.indexOf(minutes(lesson.end)) + 2,
  };
}
