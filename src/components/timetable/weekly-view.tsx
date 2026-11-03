import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAYS, SUBJECTS } from "@/data/timetable";
import { gridPlacement, lessonsForDay, periodTotal, timeBoundaries, timeLabel } from "@/lib/timetable";
import type { Day, Lesson } from "@/types/timetable";
import { DayPicker } from "./day-picker";
import { LessonCard } from "./lesson-card";

export function WeeklyView({ lessons, day, onDayChange, onSelect, onAdd }: { lessons: Lesson[]; day: Day; onDayChange: (day: Day) => void; onSelect: (lesson: Lesson) => void; onAdd: () => void }) {
  const daily = lessonsForDay(lessons, day);
  const boundaries = timeBoundaries(lessons);
  const slots = boundaries.slice(0, -1);
  const pendingTimes = lessons.filter((lesson) => lesson.timeNote).length;
  // User edits may introduce minute-sized intervals; minimum track height keeps cards readable.
  const rowSizes = slots.map((time, index) => `${Math.max(160, (boundaries[index + 1] - time) * 4)}px`).join(" ");
  return <section className="weekly-section" aria-labelledby="weekly-title">
    <div className="section-heading"><div><span className="eyebrow">Rancang minggu dengan tenang</span><h1 id="weekly-title">Jadual mingguan</h1></div><Button variant="outline" size="icon" aria-label="Tambah kelas" onClick={onAdd}><Plus aria-hidden="true" /></Button></div>
    <div className="week-summary"><Sparkles aria-hidden="true" /><div><strong>{periodTotal(lessons)} waktu · {lessons.length} sesi seminggu</strong><p>Jadual peribadi · Semua masa mengikut Malaysia.</p>{pendingTimes > 0 && <p>{pendingTimes} masa masih menunggu pengesahan.</p>}</div></div>
    <div className="mobile-week"><DayPicker day={day} onChange={onDayChange} />{daily.length === 0 && <p className="empty-state">Tiada kelas pada hari ini ✨</p>}<div className="week-day-cards">{daily.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} onSelect={onSelect} />)}</div></div>
    <div className="desktop-week" aria-label="Jadual Isnin hingga Jumaat">
      <div className="week-grid" style={{ gridTemplateRows: `52px ${rowSizes}` }}>
        <div className="week-grid-heading">Masa</div>{DAYS.map((item) => <div className="week-grid-heading" key={item.id}>{item.name}</div>)}
        {slots.map((time, index) => <div className="week-time" key={time} style={{ gridRow: index + 2, gridColumn: 1 }}>{timeLabel(`${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`)}</div>)}
        {DAYS.flatMap((item, dayIndex) => slots.map((time, index) => <div key={`${item.id}-${time}`} className="week-grid-cell" aria-hidden="true" style={{ gridColumn: dayIndex + 2, gridRow: index + 2 }} />))}
        {lessons.map((lesson) => {
          const placement = gridPlacement(lesson, boundaries);
          return <div className="week-lesson" key={lesson.id} style={{ gridColumn: DAYS.findIndex((item) => item.id === lesson.day) + 2, gridRow: `${placement.startRow} / ${placement.endRow}` }}><LessonCard lesson={lesson} compact onSelect={onSelect} /></div>;
        })}
      </div>
    </div>
    <div className="subject-legend" aria-label="Warna subjek">{Object.entries(SUBJECTS).map(([id, subject]) => <span key={id}><i aria-hidden="true" className={`tone-${subject.tone}`} />{subject.abbreviation}</span>)}</div>
    <p className="section-footnote">Setiap blok mewakili satu sesi. Masa pada label ialah rujukan tepat; tinggi minimum blok dikekalkan supaya mudah dibaca.</p>
  </section>;
}
