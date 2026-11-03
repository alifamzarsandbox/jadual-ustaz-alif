import { DAYS } from "@/data/timetable";
import type { Day } from "@/types/timetable";
import { cn } from "@/lib/utils";

export function DayPicker({ day, onChange }: { day: Day; onChange: (day: Day) => void }) {
  return <div className="day-picker" role="group" aria-label="Pilih hari jadual">
    {DAYS.map((item) => <button key={item.id} type="button" aria-pressed={day === item.id} aria-label={item.name} onClick={() => onChange(item.id)} className={cn("day-button", day === item.id && "selected")}>
      <span className="day-short">{item.short}</span><span className="day-full">{item.name}</span>
      <span className="day-dot" aria-hidden="true" />
    </button>)}
  </div>;
}
