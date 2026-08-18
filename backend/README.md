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

Atau kalau lebih nyaman pakai HeidiSQL/phpMyAdmin bawaan Laragon, tinggal buka
lalu jalankan isi `schema.sql`, lanjut `seed.sql`.

Ini sudah saya **uji jalankan langsung** di MySQL sungguhan (bukan cuma ditulis
manual) — 9 tabel + 1 view berhasil dibuat, seed 6 loket + 3 kategori + jam
operasional masuk dengan benar, dan constraint rating survei (harus 1-5) sudah
dicoba tervalidasi.

## 4. Struktur tabel

| Tabel                | Untuk apa                                                        |
|-----------------------|-------------------------------------------------------------------|
| `kategori_layanan`   | Kategori loket (Umum, Kependudukan, Perizinan, dst)               |
| `layanan`            | Loket/layanan itu sendiri (E-KTP & KIA, Samsat Digital, dst)      |
| `antrian`             | Setiap tiket yang diambil warga                                   |
| `survei`              | Submission survei kepuasan (nama opsional, saran)                 |
| `survei_rating`       | Rating per pertanyaan untuk satu survei (relasi 1-ke-banyak)      |
| `aktivitas_log`       | Feed "Aktivitas Terbaru" di dashboard admin                       |
| `users`               | Profil admin (nama, peran, status) — **bukan** password           |
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