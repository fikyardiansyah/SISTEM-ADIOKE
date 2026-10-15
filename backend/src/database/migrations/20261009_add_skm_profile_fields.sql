ALTER TABLE survei
  ADD COLUMN usia SMALLINT UNSIGNED NULL AFTER nama,
  ADD COLUMN pekerjaan VARCHAR(100) NULL AFTER usia,
  ADD COLUMN pendidikan VARCHAR(100) NULL AFTER pekerjaan,
  ADD COLUMN jenis_kelamin ENUM('Laki-laki', 'Perempuan') NULL AFTER pendidikan,
  ADD COLUMN jenis_layanan VARCHAR(500) NULL AFTER jenis_kelamin;
