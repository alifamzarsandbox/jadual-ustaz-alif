import { BookOpen, Languages, Megaphone, MicVocal, NotebookPen, Sparkles } from "lucide-react";
import { SUBJECTS } from "@/data/timetable";
import type { SubjectId } from "@/types/timetable";
import { cn } from "@/lib/utils";

const icons = { ba: Languages, aq: BookOpen, ulum: Sparkles, jawi: NotebookPen, tasmik: MicVocal, assembly: Megaphone };

export function SubjectIcon({ subject, small = false }: { subject: SubjectId; small?: boolean }) {
  const Icon = icons[subject];
  return <span aria-hidden="true" className={cn("subject-icon", `tone-${SUBJECTS[subject].tone}`, small && "subject-icon-small")}><Icon strokeWidth={1.8} /></span>;
}
