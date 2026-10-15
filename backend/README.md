# Setup Database — Sistem Adi Oke

## 1. Install dependency yang dibutuhkan

```bash
npm install mysql2 dotenv
npm install -D @types/node
```

(`mysql2` dipakai bukan `mysql` biasa karena support Promise/async-await native
dan lebih cepat — driver ini yang dipakai di `src/config/db.ts`.)

## 2. Buat file `.env`

Salin `.env.example` jadi `.env`, sesuaikan `DB_PASSWORD` dengan password MySQL
Laragon Anda (default Laragon biasanya kosong / `root` tanpa password).

## 3. Jalankan schema + seed

Lewat terminal (mysql client bawaan Laragon):

```bash
mysql -u root -p < src/database/schema.sql
mysql -u root -p < src/database/seed.sql
```

Untuk database yang sudah berjalan, tambahkan kolom penugasan loket Petugas
satu kali sebelum menjalankan backend versi ini:

```bash
mysql -u root -p antrean_adioke < src/database/migrations/20261002_add_users_loket_id.sql
```

Untuk membuat tabel survei dan rating jika belum tersedia, jalankan:

```bash
mysql -u root -p antrean_adioke < src/database/migrations/20261013_create_survei_tables.sql
```

Perintah ini menggunakan `CREATE TABLE IF NOT EXISTS`, sehingga tidak menghapus
atau menimpa tabel maupun data yang sudah ada. Jika tabel `survei` sudah ada
tetapi kolom profil SKM belum tersedia, jalankan migrasi profil di bawah ini
satu kali saja. Lewati migrasi tersebut jika kolomnya sudah ada.

Untuk database yang sudah berisi tabel `survei`, tambahkan kolom profil
responden SKM sebelum backend survei versi baru digunakan:

```bash
mysql -u root -p antrean_adioke < src/database/migrations/20261009_add_skm_profile_fields.sql
```

Migrasi ini hanya menambah kolom `usia`, `pekerjaan`, `pendidikan`,
`jenis_kelamin`, dan `jenis_layanan` ke tabel `survei`. Kolom baru dibuat
`NULL` agar respons survei lama tetap valid; formulir SKM sekarang mengisi
kolom-kolom tersebut saat respons baru dikirim.

Setiap respons menyimpan sembilan rating (nilai 1-4) ke tabel
`survei_rating`, dengan `pertanyaan_id` 1-9. Respons baru baru akan masuk ke
database setelah kedua tabel tersedia dan migrasi kolom profil selesai.

Atau kalau lebih nyaman pakai HeidiSQL/phpMyAdmin bawaan Laragon, tinggal buka
lalu jalankan isi `schema.sql`, lanjut `seed.sql`.

Skema rating membatasi nilai pada rentang 1-5 untuk kompatibilitas dengan
respons lama; endpoint SKM yang sekarang hanya menerima nilai 1-4.

## 4. Struktur tabel

| Tabel                | Untuk apa                                                        |
|-----------------------|-------------------------------------------------------------------|
| `kategori_layanan`   | Kategori loket (Umum, Kependudukan, Perizinan, dst)               |
| `layanan`            | Loket/layanan itu sendiri (E-KTP & KIA, Samsat Digital, dst)      |
| `antrian`             | Setiap tiket yang diambil warga                                   |
| `survei`              | Submission survei kepuasan (nama opsional, saran)                 |
| `survei_rating`       | Rating per pertanyaan untuk satu survei (relasi 1-ke-banyak)      |
| `aktivitas_log`       | Feed "Aktivitas Terbaru" di dashboard admin                       |
| `users`               | Profil pengguna (nama, peran, status, loket tugas) — **bukan** password |
| `pengaturan_sistem`   | Satu baris setting global (nama instansi, notifikasi, dst)        |
| `jam_operasional`     | Jam buka/tutup per hari                                            |
| `v_ringkasan_loket`   | VIEW: total/dilayani/menunggu per loket (siap pakai, tidak perlu JOIN manual di controller) |

## 5. Kenapa `users` tidak simpan password

Karena Supabase yang pegang Auth (sesuai diagram arsitektur Anda), `users` di
MySQL cuma nyimpen **profil** (nama, role, status) yang terhubung ke akun
Supabase lewat kolom `supabase_uid`. Alur login nantinya:

1. Frontend login lewat Supabase Auth (dapat JWT + `user.id` dari Supabase).
2. Backend Express verifikasi JWT itu (pakai `SUPABASE_SERVICE_ROLE_KEY`).
3. Backend cari profil admin di tabel `users` berdasarkan `supabase_uid` yang
   cocok dengan `user.id` dari token, buat ambil `peran`/`status`-nya.

Kalau ternyata Anda **tidak** mau pakai Supabase Auth dan mau autentikasi
manual sendiri di MySQL, kasih tahu — saya ubah `users` supaya nyimpen
`password_hash` (pakai bcrypt) dan bikin endpoint login/JWT sendiri di Express.