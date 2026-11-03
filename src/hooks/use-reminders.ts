"use client";
import { useEffect, useRef } from "react";
import type { Lesson } from "@/types/timetable";
import type { Preferences, ToastMessage } from "@/types/planner";
import { SUBJECTS } from "@/data/timetable";
import { dueReminders, readReminderKeys, REMINDER_KEY } from "@/lib/reminders";
import { sessionLocation } from "@/lib/timetable";
import { assetPath } from "@/lib/utils";
import { showSystemReminder } from "@/lib/system-reminder";

export function useReminders(lessons: Lesson[], preferences: Preferences, ready: boolean, notify: (toast: ToastMessage) => void) {
  const seen = useRef(new Set<string>());
  useEffect(() => {
    if (!ready || !preferences.reminderMinutes) return;
    let active = true;
    const check = async () => {
      const run = async () => {
        if (!active) return;
        const now = Date.now();
        try { for (const key of readReminderKeys(localStorage.getItem(REMINDER_KEY), now)) seen.current.add(key); } catch { /* Memory still prevents duplicates during this session. */ }
        seen.current = readReminderKeys(JSON.stringify([...seen.current]), now);
        for (const due of dueReminders(lessons, preferences.reminderMinutes, now, seen.current)) {
          seen.current.add(due.key);
          try { localStorage.setItem(REMINDER_KEY, JSON.stringify([...seen.current])); } catch { /* Best effort when storage is blocked. */ }
          const body = `${SUBJECTS[due.lesson.subject].name} · ${sessionLocation(due.lesson)} bermula dalam ${due.remaining} minit.`;
          const title = "Ustaz, kelas nak mula! 🔔";
          notify({ id: due.key, title, body });
          await showSystemReminder(preferences.browserNotifications, title, { body, tag: due.key, icon: assetPath("icons/icon-192.png") }, window.Notification,
            async () => navigator.serviceWorker?.getRegistration(assetPath("")));
        }
      };
      try {
        // A same-origin lock also deduplicates checks from multiple open tabs.
        if (navigator.locks) await navigator.locks.request("ustaz-alif-reminders", run);
        else await run();
      } catch { if (active) await run(); }
    };
    void check();
    const interval = setInterval(() => void check(), 15_000);
    const recalculate = () => void check();
    window.addEventListener("focus", recalculate);
    document.addEventListener("visibilitychange", recalculate);
    return () => { active = false; clearInterval(interval); window.removeEventListener("focus", recalculate); document.removeEventListener("visibilitychange", recalculate); };
  }, [lessons, preferences.reminderMinutes, preferences.browserNotifications, ready, notify]);
}
