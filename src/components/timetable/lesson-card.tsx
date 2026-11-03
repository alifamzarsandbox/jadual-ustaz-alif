import { Clock3, MapPin, UsersRound } from "lucide-react";
import { SUBJECTS } from "@/data/timetable";
import { duration, sessionLocation, timeLabel, timeOfDay } from "@/lib/timetable";
import type { Lesson } from "@/types/timetable";
import { SubjectIcon } from "@/components/subject-icon";
import { cn } from "@/lib/utils";
import { lessonProgress } from "@/lib/clock";

export function LessonCard({ lesson, compact = false, onSelect, currentMinute }: { lesson: Lesson; compact?: boolean; onSelect: (lesson: Lesson) => void; currentMinute?: number }) {
  const subject = SUBJECTS[lesson.subject];
  const progress = currentMinute !== undefined ? lessonProgress(lesson, currentMinute) : null;
  return <article className={cn("lesson-card", `tone-${subject.tone}`, compact && "lesson-card-compact", progress && "lesson-current")} aria-label={`${subject.name}, ${sessionLocation(lesson)}, ${lesson.start} hingga ${lesson.end}`}>
    <button type="button" className="lesson-hit-target" onClick={() => onSelect(lesson)} aria-label={`Butiran ${subject.name}, ${sessionLocation(lesson)}, ${lesson.start} hingga ${lesson.end}`} />
    {progress && <span className="current-badge">Sedang berlangsung</span>}
    <div className="lesson-main"><SubjectIcon subject={lesson.subject} small={compact} /><div className="lesson-copy">
      <div className="lesson-title"><h3>{subject.shortName}</h3>{subject.abbreviation !== subject.shortName && <span className="subject-code">{subject.abbreviation}</span>}</div>
      {lesson.subject === "aq" && <span className="lesson-subtitle">Al-Quran</span>}
      {lesson.subject === "ulum" && <span className="lesson-subtitle">Ulum</span>}
      {lesson.subject === "jawi" && <span className="lesson-subtitle">Jawi</span>}
      <div className="lesson-meta"><span>{lesson.className ? <UsersRound aria-hidden="true" /> : <MapPin aria-hidden="true" />}{sessionLocation(lesson)}</span><span><Clock3 aria-hidden="true" />{duration(lesson)} minit</span></div>
    </div></div>
    <div className="lesson-footer"><span>{timeLabel(lesson.start)} – {timeLabel(lesson.end)} <span className="time-period">{timeOfDay(lesson.start)}</span></span><span>{lesson.periods} waktu</span></div>
    {lesson.timeNote && <p className="time-review-note" title={lesson.timeNote}>Masa belum disahkan</p>}
    {progress && <div className="lesson-progress"><progress value={progress.percent} max={100} aria-label="Kemajuan kelas" /><p>{progress.elapsed} minit berlalu · {progress.remaining} minit lagi</p></div>}
  </article>;
}
