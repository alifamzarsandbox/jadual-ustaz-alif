import { Fragment } from "react";
import { Coffee, Flower2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DAYS, SUBJECTS } from "@/data/timetable";
import { lessonsForDay, minutes, periodTotal, timeLabel } from "@/lib/timetable";
import type { Day, Lesson } from "@/types/timetable";
import { DayPicker } from "./day-picker";
import { LessonCard } from "./lesson-card";

export function DailyView({ day, onDayChange, lessons, onSelect, onAdd, currentId, currentMinute }: { day: Day; onDayChange: (day: Day) => void; lessons: Lesson[]; onSelect: (lesson: Lesson) => void; onAdd: () => void; currentId?: string; currentMinute?: number }) {
  const daily = lessonsForDay(lessons, day);
  return <section className="daily-section" aria-labelledby="daily-title">
    <div className="section-heading"><div><span className="eyebrow">Satu hari, satu langkah kecil</span><h2 id="daily-title">Jadual harian <span aria-hidden="true">✿</span></h2></div><Button variant="outline" size="icon" aria-label="Tambah kelas" onClick={onAdd}><Plus aria-hidden="true" /></Button></div>
    <DayPicker day={day} onChange={onDayChange} />
    <div className="day-description"><h3>{DAYS.find((item) => item.id === day)?.name}</h3><span>{daily.length} sesi · {periodTotal(daily)} waktu</span></div>
    {daily.length === 0 && <p className="empty-state">Tiada kelas pada hari ini ✨</p>}
    <div className="timeline">
      {daily.map((lesson, index) => {
        const next = daily[index + 1];
        const gap = next ? minutes(next.start) - minutes(lesson.end) : 0;
        return <Fragment key={lesson.id}><div className="timeline-row"><div className="timeline-time"><span>{timeLabel(lesson.start)}</span><span>{timeLabel(lesson.end)}</span></div><span className={`timeline-dot tone-${SUBJECTS[lesson.subject].tone}`} aria-hidden="true" /><LessonCard lesson={lesson} onSelect={onSelect} currentMinute={lesson.id === currentId ? currentMinute : undefined} /></div>
          {gap > 0 && <div className="timeline-row gap-row"><div className="timeline-time"><span>{timeLabel(lesson.end)}</span></div><span className="timeline-dot gap-dot" aria-hidden="true" /><div className="free-time"><Coffee aria-hidden="true" /><div><strong>Masa lapang</strong><span>{gap} minit untuk berehat sekejap</span></div></div></div>}
        </Fragment>;
      })}
    </div>
    <div className="gentle-note"><Flower2 aria-hidden="true" /><p>Semoga dipermudahkan urusan mengajar, Ustaz.</p></div>
  </section>;
}
