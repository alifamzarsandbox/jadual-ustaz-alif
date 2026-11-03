# Semakan keluaran v1.0.0

**Keputusan: sedia dimuat naik secara manual.** Jadual sumber disahkan mengandungi 20 sesi, 25 waktu dan BA 1G pada Rabu dan Khamis, 15:30–16:00. Pakej tidak mengandungi imej rujukan asal, data ujian pelayar atau folder binaan setempat.

| Semakan | Hasil |
| --- | --- |
| `pnpm test` | 26 lulus; meliputi jadual, masa Malaysia, storan, peringatan, penghantaran sistem secara simulasi dan service worker. |
| `pnpm typecheck`, `pnpm lint`, `pnpm build` | Lulus. Eksport statik dibina untuk `/jadual-ustaz-alif/`. |
| `pnpm test:pwa` | Lulus: 31 aset cache, manifest, scope, saiz ikon dan fail HTML. |
| Paparan dalam pelayar Chromium | Hari Ini, Mingguan dan Tetapan pada 320, 375, 390, 430, 768 dan 1280 px; 18 kombinasi tanpa limpahan mendatar. Grid mingguan digunakan pada desktop. |
| Papan kekunci dan fokus | Pautan langkau memfokuskan kandungan utama. Pengesahan memfokuskan Batal. Escape menutup pengesahan sahaja dan fokus kembali ke butang Padam kelas. |
| Tema dan animasi | Gelap dan Kurangkan animasi kekal selepas muat semula. Animasi navigasi disahkan `none` dengan pilihan aktif. |
| Kontras pasangan yang dibetulkan | Teks pic 4.38 → 5.42:1, merah jambu 4.35 → 5.39:1, aksen ungu gelap 4.13 → 4.98:1. Semakan terpilih, bukan pensijilan aksesibiliti menyeluruh. |
| Editor dan JSON | Tambah, batal padam, padam, eksport fail, import fail dan kembali ke jadual asal diuji dalam pelayar pada origin ujian berasingan. |
| Peringatan langsung | Jadual ujian memaparkan kemajuan kelas dan toast 10 minit. Muat semula tidak mengulang toast. |
| PWA | Kemas kini daripada binaan lama ke v1.0.0 dan cache baharu disahkan. Selepas port pelayan ditutup, aplikasi masih dimuat semula dan membuka Mingguan. |
| Workflow Pages | YAML, pencetus manual, kebergantungan job dan laluan artifak disemak setempat. Runner GitHub dan URL awam belum diuji. |

Perubahan utama: `sheet.tsx` dan `confirm-sheet.tsx` membetulkan fokus dan Escape; `globals.css` melaraskan kontras dan membuang gaya tidak digunakan; `system-reminder.ts` dan ujian baharu mengesahkan laluan kebenaran dan kegagalan penghantaran. `settings-view.tsx` membaca nombor versi daripada `package.json`. Workflow keluaran berada di `.github/workflows/pages.yml`.

Bukti pelayar: [390 px](screenshots/phase-4-mobile.jpg) dan [1280 px](screenshots/phase-4-desktop.jpg).

Pemasangan Android/iPhone dan paparan notifikasi oleh sistem operasi belum diuji pada telefon fizikal. [Panduan GitHub Pages](github-pages.md) merangkumi senarai semak tersebut. Peringatan bergantung pada sesi aktif. Tiada repo jauh dibuat, tiada push dan tiada deployment.
