"use client";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Clock3, MapPin, Pencil, Save, Trash2, UsersRound } from "lucide-react";
import { DAYS, SUBJECTS } from "@/data/timetable";
import type { Day, Lesson, SubjectId } from "@/types/timetable";
import { duration, sessionLocation, timeLabel, timeOfDay } from "@/lib/timetable";
import { validateLessons } from "@/lib/validation";
import { Sheet } from "@/components/ui/sheet";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { Button } from "@/components/ui/button";
import { SubjectIcon } from "@/components/subject-icon";

export function LessonSheet({ lesson, initialDay, lessons, onSave, onDelete, onClose }: { lesson?: Lesson; initialDay: Day; lessons: Lesson[]; onSave: (lesson: Lesson) => void; onDelete: (id: string) => void; onClose: () => void }) {
  const [editing, setEditing] = useState(!lesson);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [subject, setSubject] = useState<SubjectId>(lesson?.subject ?? "ba");
  const [day, setDay] = useState<Day>(lesson?.day ?? initialDay);
  const [className, setClassName] = useState(lesson?.className ?? "");
  const [location, setLocation] = useState(lesson?.location ?? "");
  const [start, setStart] = useState(lesson?.start ?? "13:10");
  const [end, setEnd] = useState(lesson?.end ?? "13:40");
  const [periods, setPeriods] = useState(String(lesson?.periods ?? 1));
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (editing) formRef.current?.querySelector("select")?.focus(); }, [editing]);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const item: Lesson = { id: lesson?.id ?? `lesson-${crypto.randomUUID()}`, subject, day, className: className.trim(), start, end, periods: Number(periods) };
      if (location.trim()) item.location = location.trim();
      validateLessons([...lessons.filter((entry) => entry.id !== item.id), item]);
      onSave(item);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kelas tidak dapat disimpan."); }
  }
  return <Sheet title={editing ? (lesson ? "Edit kelas" : "Tambah kelas") : "Butiran kelas"} onClose={onClose}>
    {!editing && lesson ? <><div className={`lesson-detail-hero tone-${SUBJECTS[lesson.subject].tone}`}><SubjectIcon subject={lesson.subject} /><h3>{SUBJECTS[lesson.subject].name}</h3><span>{SUBJECTS[lesson.subject].abbreviation}</span></div>
      <dl className="detail-list"><div><dt><UsersRound aria-hidden="true" />{lesson.className ? "Kelas" : "Lokasi"}</dt><dd>{sessionLocation(lesson)}</dd></div>{lesson.className && lesson.location && <div><dt><MapPin aria-hidden="true" />Lokasi</dt><dd>{lesson.location}</dd></div>}<div><dt><BookOpen aria-hidden="true" />Hari</dt><dd>{DAYS.find((item) => item.id === lesson.day)?.name}</dd></div><div><dt><Clock3 aria-hidden="true" />Masa</dt><dd>{timeLabel(lesson.start)} – {timeLabel(lesson.end)} {timeOfDay(lesson.start)}</dd></div><div><dt>Tempoh</dt><dd>{duration(lesson)} minit · {lesson.periods} waktu</dd></div></dl>
      <Button className="wide-button" onClick={() => setEditing(true)}><Pencil aria-hidden="true" />Edit kelas</Button></> : <form ref={formRef} onSubmit={submit} className="lesson-form">
      <label>Subjek<select value={subject} onChange={(event) => setSubject(event.target.value as SubjectId)}>{Object.entries(SUBJECTS).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select></label>
      <label>Kelas{subject === "assembly" ? " (pilihan)" : ""}<input value={className} onChange={(event) => setClassName(event.target.value)} required={subject !== "assembly"} maxLength={40} placeholder="Contoh: 1G" list="class-options" autoComplete="off" /></label><datalist id="class-options"><option value="1G" /><option value="3A" /><option value="2B" /></datalist>
      <label>Lokasi {subject === "assembly" && !className.trim() ? "" : "(pilihan)"}<input value={location} onChange={(event) => setLocation(event.target.value)} required={subject === "assembly" && !className.trim()} maxLength={80} placeholder="Contoh: Dewan" /></label>
      <label>Hari<select value={day} onChange={(event) => setDay(event.target.value as Day)}>{DAYS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div className="form-columns"><label>Masa mula<input type="time" value={start} onChange={(event) => setStart(event.target.value)} required /></label><label>Masa tamat<input type="time" value={end} onChange={(event) => setEnd(event.target.value)} required /></label></div>
      <label>Bilangan waktu<input type="number" min="1" max="12" step="1" value={periods} onChange={(event) => setPeriods(event.target.value)} required /></label><p className="settings-note">Bilangan waktu dikira berasingan daripada tempoh. Semua masa mengikut Malaysia.</p>
      {error && <p className="form-error" role="alert">{error}</p>}<Button type="submit" className="wide-button"><Save aria-hidden="true" />Simpan kelas</Button>
      {lesson && <Button type="button" variant="outline" className="danger-button wide-button" onClick={() => setConfirmDelete(true)}><Trash2 aria-hidden="true" />Padam kelas</Button>}
    </form>}
    {confirmDelete && lesson && <ConfirmSheet title="Padam kelas ini?" message={`${SUBJECTS[lesson.subject].name} (${sessionLocation(lesson)}) akan dibuang daripada jadual peranti ini.`} confirmLabel="Ya, padam kelas" onCancel={() => setConfirmDelete(false)} onConfirm={() => onDelete(lesson.id)} />}
  </Sheet>;
}
