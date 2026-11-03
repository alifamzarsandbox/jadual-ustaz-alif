# Muat naik dan aktifkan GitHub Pages

Pakej sumber `jadual-ustaz-alif-v1.0.0-source.zip` sedia untuk repo projek bernama tepat **`jadual-ustaz-alif`**, dengan branch lalai `main`. GitHub Pages akan menggunakan laluan `/jadual-ustaz-alif/`; nama repo lain memerlukan perubahan konfigurasi sebelum dibina. Kandungan jadual lalai disertakan dalam laman, jadi pilih tetapan keterlihatan repo/Pages yang sesuai sebelum menerbitkan.

## Muat naik sumber

1. Ekstrak ZIP. Cipta repo GitHub bernama `jadual-ustaz-alif` dan gunakan branch `main`.
2. Dalam tab **Code**, pilih **Add file → Upload files**. Muat naik **isi** folder yang diekstrak supaya `package.json`, `src/`, `public/` dan `pnpm-lock.yaml` berada pada akar repo. Simpan pada `main`. ZIP itu sendiri tidak perlu dimuat naik.
3. Semak fail `.github/workflows/pages.yml` berada pada akar repo di bawah `.github/workflows/`. Jika folder bertitik tidak turut dimuat naik, pilih **Add file → Create new file**, taip laluan penuh `.github/workflows/pages.yml`, dan tampal kandungan fail daripada ZIP.
4. Semak `.gitignore` dan `public/.nojekyll` turut disertakan. Jika fail tersembunyi tertinggal, cipta dengan cara yang sama; untuk `public/.nojekyll`, satu baris kosong atau komen biasa memadai. Jangan sertakan `node_modules/`, `.next/`, `out/`, fail `.env`, atau lampiran asal.

## Aktifkan dan terbitkan

1. Buka **Settings → Pages → Build and deployment** dan pilih **GitHub Actions** sebagai *Source*.
2. Dalam **Actions**, pilih **Publish Jadual Ustaz Alif**, tekan **Run workflow**, pilih `main`, kemudian jalankan. Workflow menguji sumber, menghasilkan `out/`, memeriksa aset PWA dan menerbitkan hasil statik. Muat naik sumber sahaja tidak mencetuskan penerbitan.
3. Tunggu kedua-dua job `build` dan `deploy` lulus. Gunakan pautan pada deployment `github-pages` atau di **Settings → Pages**. URL biasa ialah `https://NAMA-PENGGUNA.github.io/jadual-ustaz-alif/`. Jika build gagal, lihat log langkah pertama yang gagal sebelum menjalankan semula.
4. Buka URL melalui HTTPS dan sahkan tarikh Malaysia, 25 waktu seminggu serta BA 1G Rabu/Khamis **3.30–4.00 petang**. Untuk keluaran seterusnya, muat naik perubahan ke `main` dan jalankan workflow secara manual sekali lagi.

Rujukan: [Sumber penerbitan GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) dan [Workflow tersuai GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Senarai semak telefon sebenar

- **Android:** buka URL HTTPS dalam Chrome. Di Tetapan aplikasi, buka **Panduan pemasangan**, kemudian cuba **Pasang aplikasi** atau pilihan skrin utama dalam menu pelayar. Lancarkan dari ikon.
- **iPhone:** buka URL HTTPS dalam Safari. Pilih **Kongsi → Tambah ke Skrin Utama** dan lancarkan dari ikon. Nama pilihan bergantung pada versi iOS.
- Pada kedua-dua peranti, tunggu Tetapan menunjukkan aset luar talian sudah dicache. Matikan sambungan seketika, buka semula aplikasi, dan semak Hari Ini serta Mingguan. Hidupkan sambungan semula untuk ujian seterusnya.
- Pada jadual ujian, cipta kelas hampir dengan waktu sekarang dan semak toast pada masa peringatan. Cuba dengan kebenaran sistem ditolak, kemudian dengan kebenaran diberikan jika platform menyokongnya. Muat semula selepas toast dan semak ia tidak berulang. Padam kelas ujian selepas selesai.
- Peringatan aplikasi hanya diperiksa ketika sesi aktif. Sistem operasi boleh menggantung aplikasi; notifikasi apabila aplikasi ditutup tidak dijamin. Tetapan dan suntingan jadual tersimpan pada pelayar/peranti masing-masing. Eksport JSON untuk sandaran.
