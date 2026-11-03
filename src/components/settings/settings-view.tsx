"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Check, Download, Monitor, Moon, Palette, Plus, RotateCcw, Smartphone, Sun, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { cn } from "@/lib/utils";
import { version } from "../../../package.json";
import { ORIGINAL_LESSONS } from "@/data/timetable";
import { exportTimetable, parseImport } from "@/lib/validation";
import type { Lesson } from "@/types/timetable";
import type { PlannerData, Preferences, ReminderMinutes, ToastMessage } from "@/types/planner";
import type { usePwa } from "@/hooks/use-pwa";

export function SettingsView({ data, onPreferences, onReplace, onAdd, onManage, onInstall, pwa, notify }: {
  data: PlannerData; onPreferences: (changes: Partial<Preferences>) => void; onReplace: (lessons: Lesson[]) => void;
  onAdd: () => void; onManage: () => void; onInstall: () => void; pwa: ReturnType<typeof usePwa>; notify: (message: ToastMessage) => void;
}) {
  const { preferences } = data;
  const fileInput = useRef<HTMLInputElement>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ lessons: Lesson[]; reset: boolean } | null>(null);
  useEffect(() => {
    const refresh = () => setPermission("Notification" in window && window.isSecureContext ? Notification.permission : "unsupported");
    const initial = setTimeout(refresh, 0);
    window.addEventListener("focus", refresh);
    return () => { clearTimeout(initial); window.removeEventListener("focus", refresh); };
  }, []);

  async function requestNotifications() {
    if (permission === "unsupported" || permission === "denied") return;
    try {
      const result = permission === "granted" ? "granted" : await Notification.requestPermission();
      setPermission(result);
      onPreferences({ browserNotifications: result === "granted" });
      if (result !== "granted") notify({ id: "notification-permission", title: "Peringatan dalam aplikasi masih tersedia", body: "Notifikasi sistem belum dibenarkan. Tiada permintaan kebenaran automatik akan dibuat." });
    } catch { setError("Notifikasi sistem tidak tersedia. Peringatan dalam aplikasi masih berfungsi."); }
  }

  async function importFile(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      if (file.size > 1_000_000) throw new Error("Fail terlalu besar. Had import ialah 1 MB.");
      const lessons = parseImport(await file.text());
      setPending({ lessons, reset: false });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Import tidak berjaya."); }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = ""; }
  }
  function exportFile() {
    const blob = new Blob([exportTimetable(data.lessons)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "jadual-ustaz-alif.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="settings-section" aria-labelledby="settings-title"><div className="section-heading"><div><span className="eyebrow">Ruang kecil, ikut keselesaan Ustaz</span><h1 id="settings-title">Tetapan</h1></div><Palette className="heading-icon" aria-hidden="true" /></div>
    <section className="settings-card" id="notification-settings"><h2><Bell aria-hidden="true" />Peringatan kelas</h2><label className="setting-field">Ingatkan saya sebelum kelas<select value={preferences.reminderMinutes} onChange={(event) => onPreferences({ reminderMinutes: Number(event.target.value) as ReminderMinutes })}><option value={0}>Tutup peringatan</option><option value={5}>5 minit</option><option value={10}>10 minit (disyorkan)</option><option value={15}>15 minit</option></select></label>
      <label className="check-setting"><input type="checkbox" checked={preferences.browserNotifications && permission === "granted"} disabled={permission !== "granted"} onChange={(event) => onPreferences({ browserNotifications: event.target.checked })} />Notifikasi sistem</label>
      {permission === "default" || (permission === "granted" && !preferences.browserNotifications) ? <Button variant="outline" onClick={() => void requestNotifications()}>Aktifkan notifikasi sistem</Button> : null}
      <p className="settings-note">{permission === "denied" ? "Kebenaran disekat. Ubah melalui tetapan pelayar jika diperlukan; peringatan dalam aplikasi tetap tersedia." : permission === "unsupported" ? "Pelayar ini tidak menyediakan notifikasi sistem. Peringatan dalam aplikasi tetap tersedia." : "Kebenaran hanya diminta apabila Ustaz menekan butang di atas."}</p>
      <p className="settings-note">Peringatan diperiksa semasa sesi aplikasi aktif. Ia tidak dijamin apabila aplikasi atau pelayar ditutup. Notifikasi sistem ialah usaha terbaik; sokongan iPhone bergantung pada pelayar dan pemasangan.</p></section>
    <section className="settings-card"><h2><Palette aria-hidden="true" />Tema paparan</h2><div className="theme-choices" role="group" aria-label="Tema paparan">{([{ id: "light", name: "Cerah", icon: Sun }, { id: "dark", name: "Gelap", icon: Moon }, { id: "system", name: "Sistem", icon: Monitor }] as const).map(({ id, name, icon: Icon }) => <Button key={id} variant="outline" className={cn("theme-choice", preferences.theme === id && "selected")} aria-pressed={preferences.theme === id} onClick={() => onPreferences({ theme: id })}><Icon aria-hidden="true" />{name}{preferences.theme === id && <Check className="theme-check" aria-hidden="true" />}</Button>)}</div><label className="check-setting"><input type="checkbox" checked={preferences.reducedMotion} onChange={(event) => onPreferences({ reducedMotion: event.target.checked })} />Kurangkan animasi</label><p className="settings-note">Tetapan kurang gerakan peranti sentiasa dihormati.</p></section>
    <section className="settings-card"><h2><BookOpen aria-hidden="true" />Jadual mengajar</h2><div className="settings-buttons"><Button onClick={onAdd}><Plus aria-hidden="true" />Tambah kelas</Button><Button variant="outline" onClick={onManage}>Urus kelas</Button><Button variant="outline" onClick={exportFile}><Download aria-hidden="true" />Eksport JSON</Button><Button variant="outline" disabled={busy} onClick={() => fileInput.current?.click()}><Upload aria-hidden="true" />{busy ? "Menyemak fail…" : "Import JSON"}</Button><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(event) => void importFile(event.target.files?.[0])} />
      <Button variant="outline" className="danger-button" onClick={() => setPending({ lessons: ORIGINAL_LESSONS, reset: true })}><RotateCcw aria-hidden="true" />Tetap semula jadual</Button></div>
      {error && <p className="form-error" role="alert">{error}</p>}<p className="settings-note">Perubahan disimpan dalam pelayar dan peranti ini sahaja. Tiada penyegerakan automatik. Eksport JSON sebagai salinan sandaran; mengosongkan data pelayar boleh memadam jadual.</p></section>
    <section className="settings-card"><div className="settings-card-title"><h2><Smartphone aria-hidden="true" />Aplikasi Ustaz</h2><span className="soft-badge">v{version}</span></div><p>{pwa.online ? "Dalam talian" : "Sedang luar talian"} · {pwa.offlineReady ? "Aset luar talian sudah dicache" : "Cache luar talian belum disahkan"}</p>{pwa.error && <p className="settings-note">{pwa.error}</p>}<div className="settings-buttons"><Button variant="outline" onClick={onInstall}>Panduan pemasangan</Button>{pwa.updateReady && <Button onClick={pwa.applyUpdate}>Muat semula untuk kemas kini</Button>}</div><p className="settings-note">Luar talian memerlukan pemuatan pertama dan cache yang berjaya. Jika pelayar membuang cache, buka semula dengan internet.</p></section>
    {pending && <ConfirmSheet title={pending.reset ? "Kembalikan jadual asal?" : "Import jadual ini?"} message={pending.reset ? "Semua suntingan jadual akan diganti dengan jadual asal Oktober 2026. Tetapan paparan dan peringatan dikekalkan." : `Gantikan ${data.lessons.length} sesi semasa dengan ${pending.lessons.length} sesi daripada fail ini? Eksport dahulu untuk menyimpan jadual semasa.`} confirmLabel={pending.reset ? "Ya, kembalikan jadual" : "Ya, import jadual"} onCancel={() => setPending(null)} onConfirm={() => { onReplace(pending.lessons); notify(pending.reset ? { id: "reset", title: "Jadual asal dikembalikan" } : { id: "import", title: "Jadual berjaya diimport", body: `${pending.lessons.length} sesi dimasukkan.` }); setPending(null); }} />}
  </section>;
}
