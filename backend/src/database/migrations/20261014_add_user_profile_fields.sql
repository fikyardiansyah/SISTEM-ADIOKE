ALTER TABLE users
  ADD COLUMN nip VARCHAR(30) NULL AFTER username,
  ADD COLUMN nomor_telepon VARCHAR(30) NULL AFTER nip,
  ADD COLUMN foto_profil MEDIUMTEXT NULL AFTER nomor_telepon;
