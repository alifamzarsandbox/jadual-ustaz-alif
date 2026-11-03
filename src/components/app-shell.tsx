"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { Bell, CalendarDays, ChevronRight, Heart, House, Moon, Settings2, Sparkles, Sun } from "lucide-react";
import { ORIGINAL_LESSONS } from "@/data/timetable";
import { assetPath, cn } from "@/lib/utils";
import { currentSchedule } from "@/lib/clock";
import { validateLessons } from "@/lib/validation";
import type { Day, Lesson } from "@/types/timetable";
import type { ToastMessage } from "@/types/planner";
import { usePlanner } from "@/hooks/use-planner";
import { useClock } from "@/hooks/use-clock";
import { usePwa } from "@/hooks/use-pwa";
import { useReminders } from "@/hooks/use-reminders";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { NextLesson } from "@/components/dashboard/next-lesson";
import { DailyView } from "@/components/timetable/daily-view";
import { WeeklyView } from "@/components/timetable/weekly-view";
import { LessonSheet } from "@/components/timetable/lesson-sheet";
import { SettingsView } from "@/components/settings/settings-view";
import { InstallGuide } from "@/components/pwa/install-guide";
import { Toasts } from "@/components/notifications/toasts";

type View = "today" | "week" | "settings";
const navigation = [{ id: "today", label: "Hari Ini", icon: House }, { id: "week", label: "Mingguan", icon: CalendarDays }, { id: "settings", label: "Tetapan", icon: Settings2 }] as const;
const originalSignature = JSON.stringify(validateLessons(ORIGINAL_LESSONS));

export function AppShell() {
  const planner = usePlanner();
  const { lessons, preferences } = planner.data;
  const now = useClock();
  const pwa = usePwa();
  const [view, setView] = useState<View>("today");
  const [selection, setSelection] = useState<{ dateKey: string; day: Day } | null>(null);
  const [sheet, setSheet] = useState<{ kind: "lesson"; lesson?: Lesson } | { kind: "install" } | null>(null);
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const main = useRef<HTMLElement>(null);
  const pendingFocus = useRef(false);
  const systemReduced = useReducedMotion();
  const reduceMotion = preferences.reducedMotion || !!systemReduced;
  const schedule = now !== null ? currentSchedule(lessons, now) : null;
  const day = selection && selection.dateKey === schedule?.dateKey ? selection.day : schedule?.day ?? null;
  const notify = useCallback((message: ToastMessage) => {
    setMessages((items) => [...items.filter((item) => item.id !== message.id), message].slice(-3));
    clearTimeout(timers.current.get(message.id));
    timers.current.set(message.id, setTimeout(() => { setMessages((items) => items.filter((item) => item.id !== message.id)); timers.current.delete(message.id); }, 12_000));
  }, []);
  useEffect(() => { const activeTimers = timers.current; return () => { activeTimers.forEach(clearTimeout); activeTimers.clear(); }; }, []);
  useReminders(lessons, preferences, planner.ready, notify);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { const value = preferences.theme === "system" ? (media.matches ? "dark" : "light") : preferences.theme; document.documentElement.dataset.theme = value; document.documentElement.style.colorScheme = value; };
    apply(); media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preferences.theme]);
  useEffect(() => { document.documentElement.dataset.reducedMotion = String(preferences.reducedMotion); }, [preferences.reducedMotion]);

  function navigate(next: View) {
    if (next === "today") setSelection(null);
    if (next !== view) { pendingFocus.current = true; setView(next); }
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function changeDay(next: Day) { if (schedule) setSelection({ day: next, dateKey: schedule.dateKey }); }
  function openLesson(lesson: Lesson) { setSheet({ kind: "lesson", lesson }); }
  function saveLesson(lesson: Lesson) {
    planner.replaceLessons([...lessons.filter((item) => item.id !== lesson.id), lesson]);
    setSheet(null); changeDay(lesson.day); notify({ id: "saved", title: "Kelas berjaya disimpan ✨" });
  }
  const isOriginal = JSON.stringify(lessons) === originalSignature;
  const dateLabel = now === null ? "Memuatkan waktu Malaysia…" : new Intl.DateTimeFormat("ms-MY", { timeZone: "Asia/Kuala_Lumpur", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);

  return <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}><div className="app-shell">
    <a className="skip-link" href="#main-content">Langkau ke kandungan</a>
    <header className="app-header"><a href="#main-content" className="brand" onClick={(event) => { event.preventDefault(); navigate("today"); }} aria-label="Jadual Ustaz Alif, halaman utama"><Image src={assetPath("illustrations/book-sparkle.svg")} width={42} height={42} alt="" priority /><span>Jadual Ustaz Alif<span className="brand-sparkle" aria-hidden="true">✧</span></span></a><div className="header-actions"><Button variant="ghost" size="icon" disabled={!planner.ready} aria-label="Tukar tema cerah atau gelap" onClick={() => planner.updatePreferences({ theme: document.documentElement.dataset.theme === "dark" ? "light" : "dark" })}><Sun className="sun-icon" aria-hidden="true" /><Moon className="moon-icon" aria-hidden="true" /></Button><Button variant="ghost" size="icon" aria-label="Tetapan peringatan" onClick={() => navigate("settings")}><Bell aria-hidden="true" /></Button></div></header>
    <div className="preview-banner"><span className="preview-dot" aria-hidden="true" /><strong>{isOriginal ? "Jadual Oktober 2026" : "Jadual peribadi Ustaz"}</strong><span>· {pwa.online ? "Waktu Malaysia" : "Luar talian"}</span></div>
    {planner.storageError && <p className="storage-warning" role="alert">{planner.storageError}</p>}
    {pwa.updateReady && !sheet && <><div className="update-banner"><span>Versi baharu tersedia.</span><Button variant="outline" onClick={pwa.applyUpdate}>Kemas kini</Button></div>{pwa.error && <p className="storage-warning" role="status">{pwa.error}</p>}</>}
    <main id="main-content" tabIndex={-1} ref={main}>
      {!planner.ready || now === null ? <p className="empty-state" role="status">Sedang menyediakan jadual Ustaz…</p> : <AnimatePresence mode="wait" initial={false}><motion.div key={view} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduceMotion ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} onAnimationComplete={() => { if (pendingFocus.current) { main.current?.focus({ preventScroll: true }); pendingFocus.current = false; } }}>
        {view === "today" && <><section className="greeting" aria-labelledby="greeting-title"><div className="greeting-copy"><div className="school-label"><span aria-hidden="true" />SK SUBANG JAYA</div><h1 id="greeting-title">Assalamualaikum,<br /><span>Ustaz!</span> <span className="wave" aria-hidden="true">👋</span></h1><p>Jom tengok jadual hari ini ✨</p><div className="date-pill"><CalendarDays aria-hidden="true" /><span>{dateLabel}</span></div></div><Image className="teacher-illustration" src={assetPath("illustrations/teacher-garden.svg")} width={230} height={220} alt="Ilustrasi Ustaz tersenyum sambil memegang buku" priority /><span className="hero-sparkle" aria-hidden="true">✦</span></section>
          <div className="dashboard-layout"><div className="dashboard-overview"><div className="overview-heading"><h2>Sekilas pandang</h2><span>Jadual semasa</span></div><SummaryCards lessons={lessons} day={schedule?.day ?? null} /><NextLesson lessons={lessons} now={now} onSelect={openLesson} /><div className="desktop-encouragement"><Image src={assetPath("illustrations/book-sparkle.svg")} alt="" width={60} height={60} /><p>Ilmu yang dikongsi,<br /><strong>kebaikan yang berpanjangan.</strong></p><Heart aria-hidden="true" /></div></div>
          {day ? <DailyView day={day} onDayChange={changeDay} lessons={lessons} onSelect={openLesson} onAdd={() => setSheet({ kind: "lesson" })} currentId={schedule?.current?.id} currentMinute={schedule?.minute} /> : <section className="weekend-card"><h2>Selamat berhujung minggu, Ustaz! 🌿</h2><p>Tiada jadual mengajar pada Sabtu dan Ahad.</p><Button onClick={() => changeDay("mon")}>Lihat jadual Isnin</Button></section>}</div>
          <button className="weekly-link" type="button" onClick={() => navigate("week")}><CalendarDays aria-hidden="true" /><span>Lihat jadual sepanjang minggu</span><ChevronRight aria-hidden="true" /></button></>}
        {view === "week" && <WeeklyView lessons={lessons} day={day ?? "mon"} onDayChange={changeDay} onSelect={openLesson} onAdd={() => setSheet({ kind: "lesson" })} />}
        {view === "settings" && <SettingsView data={planner.data} onPreferences={planner.updatePreferences} onReplace={planner.replaceLessons} onAdd={() => setSheet({ kind: "lesson" })} onManage={() => navigate("week")} onInstall={() => setSheet({ kind: "install" })} pwa={pwa} notify={notify} />}
      </motion.div></AnimatePresence>}
    </main>
    <footer className="app-footer"><Sparkles aria-hidden="true" /><p>Disusun dengan kasih, untuk Ustaz Alif<span>SK Subang Jaya · Asia/Kuala_Lumpur</span></p></footer>
    <nav className="bottom-nav" aria-label="Navigasi utama">{navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => navigate(id)} aria-current={view === id ? "page" : undefined} className={cn("nav-item", view === id && "active")}><span className="nav-icon"><Icon aria-hidden="true" strokeWidth={view === id ? 2.4 : 1.8} /></span><span>{label}</span></button>)}</nav>
    {sheet?.kind === "lesson" && <LessonSheet key={sheet.lesson?.id ?? "new"} lesson={sheet.lesson} initialDay={day ?? "mon"} lessons={lessons} onSave={saveLesson} onDelete={(id) => { planner.replaceLessons(lessons.filter((item) => item.id !== id)); setSheet(null); notify({ id: "deleted", title: "Kelas telah dipadam" }); }} onClose={() => setSheet(null)} />}
    {sheet?.kind === "install" && <InstallGuide installable={pwa.installable} installed={pwa.installed} install={pwa.install} onClose={() => setSheet(null)} />}
    <Toasts messages={messages} dismiss={(id) => setMessages((items) => items.filter((item) => item.id !== id))} />
  </div></MotionConfig>;
}
