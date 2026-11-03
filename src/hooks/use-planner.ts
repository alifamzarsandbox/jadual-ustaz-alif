"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lesson } from "@/types/timetable";
import type { PlannerData, Preferences } from "@/types/planner";
import { defaultPlanner, loadPlanner, savePlanner } from "@/lib/storage";
import { validateLessons } from "@/lib/validation";

export function usePlanner() {
  const [data, setData] = useState<PlannerData>(defaultPlanner);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string>();
  const latest = useRef(data);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      let loaded;
      try { loaded = loadPlanner(window.localStorage); } catch { loaded = { data: defaultPlanner(), error: "Storan pelayar disekat. Eksport JSON untuk menyimpan perubahan sesi ini." }; }
      latest.current = loaded.data;
      setData(loaded.data);
      setStorageError(loaded.error);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const commit = useCallback((next: PlannerData) => {
    latest.current = next;
    setData(next);
    try { setStorageError(savePlanner(window.localStorage, next)); } catch { setStorageError("Storan pelayar disekat. Eksport JSON sebelum menutup aplikasi."); }
  }, []);
  const replaceLessons = useCallback((lessons: Lesson[]) => commit({ ...latest.current, lessons: validateLessons(lessons) }), [commit]);
  const updatePreferences = useCallback((changes: Partial<Preferences>) => commit({ ...latest.current, preferences: { ...latest.current.preferences, ...changes } }), [commit]);
  return { data, ready, storageError, replaceLessons, updatePreferences };
}
