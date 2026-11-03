import type { Lesson } from "./timetable";

export type Theme = "light" | "dark" | "system";
export type ReminderMinutes = 0 | 5 | 10 | 15;
export interface Preferences {
  theme: Theme;
  reducedMotion: boolean;
  reminderMinutes: ReminderMinutes;
  browserNotifications: boolean;
}
export interface PlannerData {
  version: 1;
  lessons: Lesson[];
  preferences: Preferences;
}
export interface ToastMessage { id: string; title: string; body?: string }
