import { ORIGINAL_LESSONS } from "../data/timetable.ts";
import type { PlannerData, Preferences } from "../types/planner";
import { validateLessons } from "./validation.ts";

export const STORAGE_KEY = "jadual-ustaz-alif:v1";
export const DEFAULT_PREFERENCES: Preferences = { theme: "system", reducedMotion: false, reminderMinutes: 10, browserNotifications: false };
export function defaultPlanner(): PlannerData {
  return { version: 1, lessons: validateLessons(ORIGINAL_LESSONS), preferences: { ...DEFAULT_PREFERENCES } };
}

export function decodePlanner(raw: string): PlannerData {
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || !data.preferences) throw new Error("Versi simpanan tidak disokong.");
  const prefs = data.preferences;
  if (!["light", "dark", "system"].includes(prefs.theme) || typeof prefs.reducedMotion !== "boolean" || typeof prefs.browserNotifications !== "boolean" || ![0, 5, 10, 15].includes(prefs.reminderMinutes)) throw new Error("Tetapan simpanan tidak sah.");
  return { version: 1, lessons: validateLessons(data.lessons), preferences: {
    theme: prefs.theme, reducedMotion: prefs.reducedMotion, reminderMinutes: prefs.reminderMinutes, browserNotifications: prefs.browserNotifications,
  } };
}

export interface StorageAccess { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function loadPlanner(storage: StorageAccess): { data: PlannerData; error?: string } {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return { data: raw === null ? defaultPlanner() : decodePlanner(raw) };
  } catch {
    return { data: defaultPlanner(), error: "Simpanan tidak dapat dibaca. Jadual asal dipaparkan; data lama tidak ditulis ganti secara automatik. Eksport jadual sebelum membuat perubahan." };
  }
}

export function savePlanner(storage: StorageAccess, data: PlannerData): string | undefined {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {
    return "Perubahan hanya disimpan dalam sesi ini kerana storan pelayar tidak tersedia atau penuh. Eksport JSON untuk menyimpan salinan.";
  }
}
