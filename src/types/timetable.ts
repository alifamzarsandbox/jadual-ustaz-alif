export type Day = "mon" | "tue" | "wed" | "thu" | "fri";
export type SubjectId = "ba" | "aq" | "ulum" | "jawi" | "tasmik" | "assembly";
export type SubjectTone = "lavender" | "mint" | "peach" | "pink" | "blue" | "butter";

export interface Subject {
  name: string;
  shortName: string;
  abbreviation: string;
  tone: SubjectTone;
}

export interface Lesson {
  id: string;
  day: Day;
  subject: SubjectId;
  className: string;
  location?: string;
  start: string;
  end: string;
  periods: number;
  sourcePeriods?: number[];
  timeNote?: string;
}
