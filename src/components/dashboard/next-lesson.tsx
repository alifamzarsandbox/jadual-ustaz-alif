import { Clock3, Coffee, Flower2 } from "lucide-react";
import { SUBJECTS } from "@/data/timetable";
import { minutes, sessionLocation, timeLabel, timeOfDay } from "@/lib/timetable";
import { countdown, currentSchedule, lessonProgress } from "@/lib/clock";
import type { Lesson } from "@/types/timetable";
import { SubjectIcon } from "@/components/subject-icon";

export function NextLesson({ lessons, now, onSelect }: { lessons: Lesson[]; now: number; onSelect: (lesson: Lesson) => void }) {
  const schedule = currentSchedule(lessons, now);
  const lesson = schedule.current ?? schedule.next;
  if (!lesson) return <section className="next-lesson quiet-card"><Flower2 aria-hidden="true" /><h2>{!schedule.day ? "Selamat berhujung minggu, Ustaz! 🌿" : schedule.daily.length ? "Alhamdulillah, semua kelas dah selesai! 🌸" : "Tiada kelas hari ini ✨"}</h2><p>Semoga hari Ustaz tenang dan bermakna.</p></section>;
  const subject = SUBJECTS[lesson.subject];
  const progress = schedule.current ? lessonProgress(lesson, schedule.minute) : null;
  const isGap = !schedule.current && schedule.daily.some((item) => minutes(item.end) <= schedule.minute);
  return <section className="next-lesson" aria-labelledby="next-title"><div className="next-heading"><h2 id="next-title"><Clock3 aria-hidden="true" />{progress ? "Sedang berlangsung" : "Kelas seterusnya 📚"}</h2><span className="soft-badge">Hari ini</span></div>
    <button type="button" className="next-body next-open" onClick={() => onSelect(lesson)} aria-label={`Butiran ${subject.name}, ${sessionLocation(lesson)}`}><SubjectIcon subject={lesson.subject} /><span className="next-copy"><strong>{subject.shortName} {subject.abbreviation !== subject.shortName && <span>({subject.abbreviation})</span>}</strong><span>{sessionLocation(lesson)} · {timeLabel(lesson.start)} – {timeLabel(lesson.end)} {timeOfDay(lesson.start)}</span></span></button>
    {progress ? <div className="lesson-progress"><progress value={progress.percent} max={100} aria-label="Kemajuan kelas semasa" /><p>{progress.elapsed} minit berlalu · {progress.remaining} minit lagi <strong>{progress.percent}%</strong></p></div> : <p className="countdown-label">Bermula dalam {countdown(minutes(lesson.start) - schedule.minute)}</p>}
    {isGap && <p className="next-disclaimer"><Coffee aria-hidden="true" /> Masa untuk berehat sekejap ☕</p>}
  </section>;
}
