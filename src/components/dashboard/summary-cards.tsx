import { BookOpen, CalendarDays, Layers3, Sun } from "lucide-react";
import { periodTotal, lessonsForDay } from "@/lib/timetable";
import type { Day, Lesson } from "@/types/timetable";

export function SummaryCards({ lessons, day }: { lessons: Lesson[]; day: Day | null }) {
  const cards = [
    { label: "Waktu seminggu", value: periodTotal(lessons), icon: CalendarDays, tone: "lavender" },
    { label: "Hari mengajar", value: new Set(lessons.map((lesson) => lesson.day)).size, icon: Sun, tone: "mint" },
    { label: "Waktu hari ini", value: day ? periodTotal(lessonsForDay(lessons, day)) : 0, icon: BookOpen, tone: "peach" },
    { label: "Jenis subjek", value: new Set(lessons.map((lesson) => lesson.subject)).size, icon: Layers3, tone: "pink" },
  ];
  return <section className="summary-grid" aria-label="Ringkasan jadual mengajar">{cards.map(({ label, value, icon: Icon, tone }) => <div key={label} className={`summary-card tone-${tone}`}><span className="summary-symbol"><Icon aria-hidden="true" /></span><div><strong>{value}</strong><span>{label}</span></div></div>)}</section>;
}
