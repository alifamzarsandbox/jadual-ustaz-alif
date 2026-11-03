import { useState } from "react";
import { BookOpen, Download, Share2 } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function InstallGuide({ installable, installed, install, onClose }: { installable: boolean; installed: boolean; install: () => Promise<void>; onClose: () => void }) {
  const [platform, setPlatform] = useState<"android" | "ios">("android");
  return <Sheet title="Pasang Jadual Ustaz Alif" onClose={onClose}><div className="install-art"><BookOpen aria-hidden="true" /><span aria-hidden="true">✦</span></div><p>Akses lebih pantas dari skrin utama telefon Ustaz.</p>
    {installed ? <p className="success-note">Aplikasi sedang dibuka dalam mod dipasang.</p> : installable && <Button className="wide-button" onClick={() => void install()}><Download aria-hidden="true" />Pasang aplikasi</Button>}
    <div className="theme-choices install-platforms" role="group" aria-label="Jenis telefon"><Button variant="outline" aria-pressed={platform === "android"} onClick={() => setPlatform("android")}>Android</Button><Button variant="outline" aria-pressed={platform === "ios"} onClick={() => setPlatform("ios")}>iPhone</Button></div>
    {platform === "android" ? <ol className="install-steps"><li>Buka aplikasi melalui pelayar seperti Chrome.</li><li>Buka menu pelayar (⋮), kemudian pilih <strong>Pasang aplikasi</strong> atau <strong>Tambah ke skrin utama</strong>.</li><li>Ikut arahan pengesahan yang dipaparkan.</li></ol> : <ol className="install-steps"><li>Buka laman ini dalam <strong>Safari</strong>.</li><li>Tekan butang <Share2 aria-label="Kongsi" /> <strong>Kongsi</strong>, kemudian pilih <strong>Add to Home Screen / Tambah ke Skrin Utama</strong>.</li><li>Sahkan nama dan tekan <strong>Add / Tambah</strong>. Jika pilihan “Open as Web App” tersedia, hidupkannya.</li></ol>}
    <p className="settings-note">Nama dan lokasi pilihan pemasangan berbeza mengikut pelayar. Jika tiada pilihan pemasangan, aplikasi masih boleh digunakan melalui pelayar.</p><p className="settings-note">Luar talian tersedia selepas pemuatan awal dan cache aset berjaya. Pemasangan tidak menjamin peringatan apabila aplikasi ditutup.</p>
  </Sheet>;
}
