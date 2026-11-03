# Jadual Ustaz Alif ✨

Aplikasi jadual mengajar peribadi EN. MUHAMMAD ALIF AMZAR B. AZMON, SK Subang Jaya. Bahasa Melayu, mudah alih dahulu, sasaran hos GitHub Pages.

**Versi 1.0.0 sedia dimuat naik ke GitHub.** Jadual asal: 20 sesi / 25 waktu. BA 1G Rabu dan Khamis ialah **15:30–16:00**, disahkan pengguna. Lihat [panduan muat naik dan pengaktifan](docs/github-pages.md) serta [laporan semakan akhir](docs/phase-4-report.md).

## Jalankan secara setempat

Keperluan: Node.js 24 dan pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Buka `http://127.0.0.1:3000/jadual-ustaz-alif/`. Cache PWA tidak diaktifkan dalam mod pembangunan. Untuk semakan eksport sebenar:

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:pwa
pnpm preview
```

Pratonton menghidangkan `out/` pada laluan sama. Ia alat pembangunan sahaja, bukan backend aplikasi. Tutup dengan Ctrl+C selepas selesai. Gunakan origin sama untuk simpanan: localhost dan 127.0.0.1 mempunyai storan berasingan.

## Fungsi tersedia

- Hari, tarikh dan masa Malaysia; paparan hujung minggu dan hari tanpa kelas.
- Kelas semasa, kemajuan, masa berbaki dan countdown kelas seterusnya pada hari ini.
- Butiran, tambah/edit/padam, pengesahan sebelum padam/import/tetap semula.
- Pengesahan masa, subjek, hari, ID, kelas, bilangan waktu dan pertindihan; maksimum 200 sesi.
- Storan jadual/tetapan, tema Cerah/Gelap/Sistem dan kurang animasi.
- Eksport/import JSON versi 1, had 1 MB. Eksport mengandungi jadual sahaja, bukan tetapan peranti.
- Peringatan 5/10/15 minit atau ditutup, toast dan notifikasi sistem jika dibenarkan.
- Manifest, ikon 192/512, maskable, Apple touch, cache aset serta panduan Android/iPhone.

## PWA dan peringatan

Binaan menghasilkan `out/sw.js` dengan hash kandungan dan senarai aset. Cache versi lengkap dipasang dahulu; pemasangan gagal tidak menggantikan cache lama. Pengguna memilih butang kemas kini apabila versi tersedia; tab aplikasi lain perlu ditutup dahulu. Hanya cache milik aplikasi ini dibersihkan.

Luar talian memerlukan pemuatan awal dan cache berjaya melalui HTTPS atau localhost. Jika pelayar membuang cache, sambung internet dan buka semula. Pemasangan telefon sebenar belum diuji.

Peringatan diperiksa ketika aplikasi aktif, setiap 15 saat dan apabila fokus/keterlihatan berubah. Toleransi 90 saat mengelakkan peringatan lama dihantar berturut-turut selepas aplikasi tidur. Kunci tarikh + ID sesi menghalang pendua termasuk selepas reload. Web Locks membantu mengelakkan pendua antara tab; apabila storan atau Web Locks tidak tersedia, jaminan merentas tab terhad.

Kebenaran notifikasi hanya diminta selepas butang pengaktifan ditekan. Penolakan atau ciri tidak disokong tidak menghalang toast. **Peringatan tidak dijamin apabila aplikasi/pelayar ditutup atau digantung oleh sistem.** Tiada push server atau sync peranti. Eksport JSON sebagai sandaran sebelum mengosongkan data pelayar.

## Asas teknikal

Next.js App Router, React, TypeScript ketat, Tailwind CSS, Button shadcn/ui berasaskan Radix Slot/CVA, Lucide dan Motion. Font Nunito/Inter dipakejkan setempat. Eksport statik: `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`, basePath/assetPrefix `/jadual-ustaz-alif` dan `.nojekyll`. Tiada API, server action, pangkalan data atau servis berbayar.

| Laluan | Kandungan |
| --- | --- |
| src/data/timetable.ts | Jadual asal dan jumlah rujukan |
| src/lib/ | Masa, validasi, storan dan peringatan |
| src/hooks/ | Jam aktif, persistence, peringatan dan PWA |
| src/components/ | Dashboard, jadual, editor, tetapan, dialog dan toast |
| public/ | Manifest, ikon dan ilustrasi |
| scripts/ | Ikon, service worker, semakan eksport dan pratonton |
| tests/ | Data, logik aplikasi dan service worker |
| docs/phase-4-report.md | Keputusan semakan akhir dan batasan |
| .github/workflows/pages.yml | Bina, semak dan terbitkan selepas dicetuskan secara manual |

ESLint 9 dipilih bagi keserasian plugin; registry menandakannya deprecated. Semak peer dependency sebelum menaik taraf major pada fasa keluaran.

## Empat fasa

1. Asas projek dan UI — selesai dan diluluskan.
2. Integrasi data — selesai dan diluluskan; masa BA 1G disahkan.
3. PWA, peringatan dan interaktiviti — pelaksanaan selesai; batasan ujian direkodkan.
4. Pengujian akhir dan persediaan GitHub Pages — selesai setempat. Semakan telefon fizikal dan run pertama di GitHub menunggu pengaktifan.

Tiada push, remote repository atau deployment dibuat. Workflow dicetuskan hanya melalui **Run workflow** di GitHub.

Rujukan: [eksport statik Next.js](https://nextjs.org/docs/app/guides/static-exports), [service worker](https://developer.mozilla.org/en-US/docs/Web/Service_Worker_API/Using_Service_Workers), [PWA boleh dipasang](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).
