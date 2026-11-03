import type { Day, Lesson, Subject, SubjectId } from "@/types/timetable";

export const DAYS: { id: Day; short: string; name: string }[] = [
  { id: "mon", short: "Isn", name: "Isnin" },
  { id: "tue", short: "Sel", name: "Selasa" },
  { id: "wed", short: "Rab", name: "Rabu" },
  { id: "thu", short: "Kha", name: "Khamis" },
  { id: "fri", short: "Jum", name: "Jumaat" },
];

export const SUBJECTS: Record<SubjectId, Subject> = {
  ba: { name: "Bahasa Arab", shortName: "Bahasa Arab", abbreviation: "BA", tone: "lavender" },
  aq: { name: "Pendidikan Islam — Al-Quran", shortName: "Pendidikan Islam", abbreviation: "PI AQ", tone: "mint" },
  ulum: { name: "Pendidikan Islam — Ulum", shortName: "Pendidikan Islam", abbreviation: "PI U", tone: "peach" },
  jawi: { name: "Pendidikan Islam — Jawi", shortName: "Pendidikan Islam", abbreviation: "PI J", tone: "pink" },
  tasmik: { name: "Tasmik", shortName: "Tasmik", abbreviation: "Tasmik", tone: "blue" },
  assembly: { name: "Perhimpunan", shortName: "Perhimpunan", abbreviation: "PER", tone: "butter" },
};

export const TIMETABLE_REFERENCE = {
  teacher: "EN. MUHAMMAD ALIF AMZAR B. AZMON",
  school: "SK Subang Jaya",
  edition: "Oktober 2026",
  source: "reference/timetable.jpg",
  timezone: "Asia/Kuala_Lumpur",
  totalPeriods: 25,
  subjectPeriods: { ba: 6, assembly: 1, tasmik: 6, aq: 6, ulum: 4, jawi: 2 },
} as const;

// User confirmed period 6 for BA 1G on Wednesday and Thursday: 15:30–16:00.
// The adjacent 15:40–16:00 heading in the source does not apply to these sessions.

// Transcribed from reference/timetable.jpg, never from the mockup.
// A merged cell is one session; periods/sourcePeriods retain the printed count.
// Times use 24-hour local Malaysia time. Dewan is a venue, not a fourth class.
export const ORIGINAL_LESSONS: Lesson[] = [
  { id: "oct26-mon-per", day: "mon", subject: "assembly", className: "", location: "Dewan", start: "13:10", end: "13:40", periods: 1, sourcePeriods: [1] },
  { id: "oct26-mon-aq-1g", day: "mon", subject: "aq", className: "1G", start: "13:40", end: "14:40", periods: 2, sourcePeriods: [2, 3] },
  { id: "oct26-mon-tasmik-1g", day: "mon", subject: "tasmik", className: "1G", start: "14:40", end: "15:10", periods: 1, sourcePeriods: [4] },
  { id: "oct26-mon-aq-3a", day: "mon", subject: "aq", className: "3A", start: "17:30", end: "18:30", periods: 2, sourcePeriods: [10, 11] },
  { id: "oct26-tue-ulum-3a", day: "tue", subject: "ulum", className: "3A", start: "13:10", end: "14:10", periods: 2, sourcePeriods: [1, 2] },
  { id: "oct26-tue-aq-1g", day: "tue", subject: "aq", className: "1G", start: "14:10", end: "14:40", periods: 1, sourcePeriods: [3] },
  { id: "oct26-tue-jawi-1g", day: "tue", subject: "jawi", className: "1G", start: "14:40", end: "15:10", periods: 1, sourcePeriods: [4] },
  { id: "oct26-tue-ba-3a", day: "tue", subject: "ba", className: "3A", start: "17:00", end: "17:30", periods: 1, sourcePeriods: [9] },
  { id: "oct26-tue-tasmik-2b", day: "tue", subject: "tasmik", className: "2B", start: "17:30", end: "18:00", periods: 1, sourcePeriods: [10] },
  { id: "oct26-wed-aq-3a", day: "wed", subject: "aq", className: "3A", start: "13:10", end: "13:40", periods: 1, sourcePeriods: [1] },
  { id: "oct26-wed-jawi-3a", day: "wed", subject: "jawi", className: "3A", start: "13:40", end: "14:10", periods: 1, sourcePeriods: [2] },
  { id: "oct26-wed-ba-1g", day: "wed", subject: "ba", className: "1G", start: "15:30", end: "16:00", periods: 1, sourcePeriods: [6] },
  { id: "oct26-wed-ba-3a", day: "wed", subject: "ba", className: "3A", start: "16:30", end: "17:30", periods: 2, sourcePeriods: [8, 9] },
  { id: "oct26-wed-tasmik-1g", day: "wed", subject: "tasmik", className: "1G", start: "17:30", end: "18:00", periods: 1, sourcePeriods: [10] },
  { id: "oct26-thu-ba-1g-p4", day: "thu", subject: "ba", className: "1G", start: "14:40", end: "15:10", periods: 1, sourcePeriods: [4] },
  { id: "oct26-thu-ba-1g-p6", day: "thu", subject: "ba", className: "1G", start: "15:30", end: "16:00", periods: 1, sourcePeriods: [6] },
  { id: "oct26-thu-tasmik-3a", day: "thu", subject: "tasmik", className: "3A", start: "17:00", end: "17:30", periods: 1, sourcePeriods: [9] },
  { id: "oct26-thu-tasmik-2b", day: "thu", subject: "tasmik", className: "2B", start: "17:30", end: "18:00", periods: 1, sourcePeriods: [10] },
  { id: "oct26-fri-ulum-1g", day: "fri", subject: "ulum", className: "1G", start: "14:10", end: "15:10", periods: 2, sourcePeriods: [3, 4] },
  { id: "oct26-fri-tasmik-3a", day: "fri", subject: "tasmik", className: "3A", start: "16:30", end: "17:00", periods: 1, sourcePeriods: [8] },
];
