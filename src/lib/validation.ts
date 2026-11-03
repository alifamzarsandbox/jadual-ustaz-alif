import type { Lesson, Day, SubjectId } from "../types/timetable";
import { minutes } from "./timetable.ts";

const days = ["mon", "tue", "wed", "thu", "fri"];
const subjects = ["ba", "aq", "ulum", "jawi", "tasmik", "assembly"];
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

export function validateLessons(input: unknown): Lesson[] {
  if (!Array.isArray(input) || input.length > 200) throw new Error("Jadual mesti senarai dengan maksimum 200 sesi.");
  const ids = new Set<string>();
  const lessons = input.map((value, index): Lesson => {
    const fail = (message: string): never => { throw new Error(`Sesi ${index + 1}: ${message}`); };
    if (!record(value)) return fail("data tidak sah.");
    const { id, day, subject, start, end, periods } = value;
    if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || ids.has(id)) return fail("ID kosong, tidak sah atau berulang.");
    ids.add(id);
    if (typeof day !== "string" || !days.includes(day)) return fail("pilih hari Isnin hingga Jumaat.");
    if (typeof subject !== "string" || !subjects.includes(subject)) return fail("subjek tidak dikenali.");
    if (typeof start !== "string" || typeof end !== "string" || !timePattern.test(start) || !timePattern.test(end) || minutes(start) >= minutes(end)) return fail("masa tamat mesti selepas masa mula pada hari yang sama.");
    if (typeof periods !== "number" || !Number.isInteger(periods) || periods < 1 || periods > 12) return fail("bilangan waktu mesti 1 hingga 12.");
    if (typeof value.className !== "string" || value.className.length > 40) return fail("kelas tidak sah.");
    const className = value.className.trim();
    if (subject !== "assembly" && !className) return fail("kelas diperlukan.");
    if (value.location !== undefined && (typeof value.location !== "string" || value.location.length > 80)) return fail("lokasi tidak sah.");
    const location = typeof value.location === "string" ? value.location.trim() : undefined;
    if (subject === "assembly" && !className && !location) return fail("lokasi perhimpunan diperlukan.");
    const lesson: Lesson = { id, day: day as Day, subject: subject as SubjectId, className, start, end, periods };
    if (location) lesson.location = location;
    if (value.sourcePeriods !== undefined) {
      if (!Array.isArray(value.sourcePeriods) || value.sourcePeriods.length !== periods || value.sourcePeriods.some((period) => !Number.isInteger(period) || period < 1 || period > 24) || new Set(value.sourcePeriods).size !== periods) return fail("rujukan waktu sumber tidak sah.");
      lesson.sourcePeriods = [...value.sourcePeriods];
    }
    // Copy only permitted fields; never trust imported notes, HTML or prototypes.
    return lesson;
  });
  for (const day of days) {
    const daily = lessons.filter((lesson) => lesson.day === day).sort((a, b) => minutes(a.start) - minutes(b.start));
    for (let i = 1; i < daily.length; i++) {
      if (minutes(daily[i].start) < minutes(daily[i - 1].end)) throw new Error(`Kelas bertindih: ${daily[i - 1].start}–${daily[i - 1].end} dan ${daily[i].start}–${daily[i].end} pada hari yang sama.`);
    }
  }
  return lessons;
}

export function parseImport(text: string) {
  if (text.length > 1_000_000) throw new Error("Fail terlalu besar. Had import ialah 1 MB.");
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error("Fail bukan JSON yang sah."); }
  if (!record(value) || value.version !== 1) throw new Error("Format tidak disokong. Gunakan fail eksport Jadual Ustaz Alif versi 1.");
  return validateLessons(value.lessons);
}

export function exportTimetable(lessons: Lesson[]) {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), lessons: validateLessons(lessons) }, null, 2);
}
