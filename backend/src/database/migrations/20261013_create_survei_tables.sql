CREATE TABLE IF NOT EXISTS survei (
  id VARCHAR(36) NOT NULL,
  nama VARCHAR(150) NULL,
  saran TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS survei_rating (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  survei_id VARCHAR(36) NOT NULL,
  pertanyaan_id TINYINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_survei_rating_pertanyaan (survei_id, pertanyaan_id),
  CONSTRAINT chk_survei_rating_pertanyaan
    CHECK (pertanyaan_id BETWEEN 1 AND 9),
  CONSTRAINT chk_survei_rating_nilai
    CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_survei_rating_survei
    FOREIGN KEY (survei_id) REFERENCES survei (id)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARACTER SET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
