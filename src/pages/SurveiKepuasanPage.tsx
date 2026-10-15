import { useState, type FormEvent } from "react";
import { useQueue } from "../context/useQueue";
import "./SurveiKepuasanPage.css";

const pekerjaan = [
  "PNS",
  "TNI",
  "POLRI",
  "Wiraswasta",
  "Karyawan Swasta",
  "Pelajar/Mahasiswa",
  "Mengurus Rumah Tangga",
  "Belum/Tidak Bekerja",
  "Lainnya",
];

const pendidikan = [
  "Tidak/Belum Sekolah",
  "SD/Sederajat",
  "SMP/Sederajat",
  "SMA/SMK/Sederajat",
  "Diploma I/II",
  "Diploma III/Sarjana Muda/Akademia",
  "Diploma IV/Strata I",
  "Strata II",
  "Strata III",
];

const jenisLayanan = [
  "Penerbitan KTP-el (perekaman baru, kehilangan, kerusakan, perubahan data)",
  "Penerbitan KIA (penerbitan baru, perpanjangan, perubahan data)",
  "Register Penduduk Non Permanen",
  "Konsultasi Layanan Akudicari",
  "Pengesahan Permohonan Akte-akte (kelahiran, perkawinan, kematian, dll)",
  "Pengesahan Surat Keterangan (kelakuan baik, SKTT orang asing, pensiunan, dll)",
  "OSS (Online Single Submission)",
  "Warkah (silsilah, waris, pertanahan, dll)",
  "Layanan lainnya",
];

const pertanyaan = [
  {
    judul: "PERSYARATAN",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang kesesuaian persyaratan pelayanan dengan jenis pelayanannya?",
    pilihan: ["Tidak Sesuai", "Kurang Sesuai", "Sesuai", "Sangat Sesuai"],
  },
  {
    judul: "SISTEM, MEKANISME, DAN PROSEDUR",
    pertanyaan:
      "Bagaimana pemahaman Saudara tentang kemudahan prosedur pelayanan di unit ini?",
    pilihan: ["Tidak Mudah", "Kurang Mudah", "Mudah", "Sangat Mudah"],
  },
  {
    judul: "WAKTU PENYELESAIAN",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang kecepatan waktu dalam memberikan pelayanan?",
    pilihan: ["Tidak Cepat", "Kurang Cepat", "Cepat", "Sangat Cepat"],
  },
  {
    judul: "BIAYA/TARIF",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang kewajaran biaya/tarif dalam pelayanan?",
    pilihan: ["Sangat Mahal", "Cukup Mahal", "Murah", "Gratis"],
  },
  {
    judul: "PRODUK SPESIFIKASI JENIS LAYANAN",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang kesesuaian produk pelayanan antara yang tercantum dalam standar pelayanan dengan hasil yang diberikan?",
    pilihan: ["Tidak Sesuai", "Kurang Sesuai", "Sesuai", "Sangat Sesuai"],
  },
  {
    judul: "KOMPETENSI PELAKSANA",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang kompetensi/kemampuan petugas dalam pelayanan?",
    pilihan: ["Tidak Kompeten", "Kurang Kompeten", "Kompeten", "Sangat Kompeten"],
  },
  {
    judul: "PERILAKU PELAKSANA",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang perilaku petugas dalam pelayanan terkait kesopanan dan keramahan?",
    pilihan: [
      "Tidak Sopan dan Ramah",
      "Kurang Sopan dan Ramah",
      "Sopan dan Ramah",
      "Sangat Sopan dan Ramah",
    ],
  },
  {
    judul: "SARANA DAN PRASARANA",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang kualitas sarana dan prasarana?",
    pilihan: ["Buruk", "Cukup", "Baik", "Sangat Baik"],
  },
  {
    judul: "PENANGANAN PENGADUAN, SARAN, DAN MASUKAN",
    pertanyaan:
      "Bagaimana pendapat Saudara tentang penanganan pengaduan pengguna layanan?",
    pilihan: [
      "Tidak Ada",
      "Ada tetapi tidak berfungsi",
      "Berfungsi kurang maksimal",
      "Dikelola dengan baik",
    ],
  },
];

function FieldLabel({
  children,
  required = false,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <span className="skm-field-label">
      {children}
      {required && (
        <>
          {" "}
          <span className="skm-required" aria-hidden="true">
            *
          </span>
          <span className="skm-sr-only"> wajib diisi</span>
        </>
      )}
    </span>
  );
}

export default function SurveiKepuasanPage() {
  const { submitSurvei } = useQueue();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const ratings = Object.fromEntries(
      pertanyaan.map((_, index) => [
        index + 1,
        Number(formData.get(`unsur-${index + 1}`)),
      ])
    );
    const jenisKelamin = formData.get("jenisKelamin");
    if (jenisKelamin !== "Laki-laki" && jenisKelamin !== "Perempuan") {
      setSubmitError("Pilih jenis kelamin yang valid.");
      setSubmitting(false);
      return;
    }

    try {
      await submitSurvei({
        nama: String(formData.get("nama") ?? "").trim(),
        usia: Number(formData.get("usia")),
        pekerjaan: String(formData.get("pekerjaan")),
        pendidikan: String(formData.get("pendidikan")),
        jenisKelamin,
        jenisLayanan: String(formData.get("jenisLayanan")),
        ratings,
        saran: String(formData.get("saran") ?? ""),
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Survei gagal dikirim. Silakan coba kembali."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="skm-page">
      <div className="skm-container">
        <header className="skm-header">
          <p className="skm-eyebrow">
            <span aria-hidden="true" />
            PEMERINTAH KABUPATEN BADUNG
          </p>
          <h1>Survei Kepuasan Masyarakat</h1>
          <p className="skm-intro">
            Bantu kami meningkatkan kualitas pelayanan publik di Kecamatan
            Kuta Selatan dengan mengisi survei singkat ini. Nama bersifat
            opsional; jawaban tanpa nama tetap anonim.
          </p>
        </header>

        {submitted ? (
          <section className="skm-thank-you" aria-live="polite">
            <span className="skm-thank-you-icon" aria-hidden="true">
              ✓
            </span>
            <h2>Terima kasih atas partisipasi Anda</h2>
            <p>
              Pendapat Anda sangat berarti untuk peningkatan kualitas pelayanan
              kami.
            </p>
          </section>
        ) : (
          <form className="skm-form" onSubmit={handleSubmit}>
            <ol className="skm-steps" aria-label="Tahapan survei">
              <li className="skm-step skm-step-active">
                <span>1</span>
                <small>Profil Responden</small>
              </li>
              <li className="skm-step">
                <span>2</span>
                <small>Unsur Pelayanan (9)</small>
              </li>
              <li className="skm-step">
                <span>3</span>
                <small>Saran &amp; Masukan</small>
              </li>
            </ol>

            <p className="skm-notice">
              <span aria-hidden="true">!</span>
              Pertanyaan bertanda <strong>*</strong> wajib diisi untuk
              validasi survei.
            </p>

            <section className="skm-card" aria-labelledby="skm-profile-title">
              <div className="skm-card-heading">
                <div>
                  <h2 className="skm-section-title" id="skm-profile-title">
                    <span className="skm-heading-icon" aria-hidden="true">1</span>
                    Profil Responden
                  </h2>
                  <p className="skm-card-description">
                    Identitas Anda membantu kami memahami demografi pengguna.
                  </p>
                </div>
                <span className="skm-card-tag">IDENTITAS DIRI</span>
              </div>
              <div className="skm-profile-grid">
                <label className="skm-field">
                  <FieldLabel>Nama</FieldLabel>
                  <input
                    type="text"
                    name="nama"
                    maxLength={150}
                    autoComplete="name"
                    placeholder="Nama Anda (opsional)"
                  />
                </label>

                <label className="skm-field">
                  <FieldLabel required>Usia</FieldLabel>
                  <input
                    type="number"
                    name="usia"
                    min="1"
                    max="120"
                    placeholder="Usia Anda (tahun)"
                    required
                  />
                </label>

                <fieldset className="skm-fieldset skm-gender-field">
                  <legend>
                    <FieldLabel required>Jenis Kelamin</FieldLabel>
                  </legend>
                  <div className="skm-options skm-inline-options">
                    {["Laki-laki", "Perempuan"].map((item) => (
                      <label className="skm-option" key={item}>
                        <input
                          type="radio"
                          name="jenisKelamin"
                          value={item}
                          required
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="skm-fieldset">
                  <legend>
                    <FieldLabel required>Pekerjaan</FieldLabel>
                  </legend>
                  <div className="skm-options skm-profile-list">
                    {pekerjaan.map((item) => (
                      <label className="skm-option" key={item}>
                        <input type="radio" name="pekerjaan" value={item} required />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="skm-fieldset">
                  <legend>
                    <FieldLabel required>Pendidikan Terakhir</FieldLabel>
                  </legend>
                  <div className="skm-options skm-profile-list">
                    {pendidikan.map((item) => (
                      <label className="skm-option" key={item}>
                        <input
                          type="radio"
                          name="pendidikan"
                          value={item}
                          required
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>

            <section className="skm-card">
              <label className="skm-field" htmlFor="jenis-layanan">
                <FieldLabel required>Jenis layanan yang diterima</FieldLabel>
                <span className="skm-field-hint">
                  Pilih jenis layanan yang Anda dapatkan saat berkunjung ke
                  kantor Kecamatan Kuta Selatan.
                </span>
                <select id="jenis-layanan" name="jenisLayanan" required defaultValue="">
                  <option value="" disabled>
                    Pilih jenis layanan
                  </option>
                  {jenisLayanan.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <div className="skm-rating-heading">
              <span aria-hidden="true">2</span>
              <div>
                <h2>Penilaian Unsur Pelayanan</h2>
                <p>Berikan penilaian objektif Anda terhadap kualitas pelayanan di bawah.</p>
              </div>
            </div>

            {pertanyaan.map((item, index) => (
              <fieldset className="skm-card skm-question" key={item.judul}>
                <legend className="skm-question-legend">
                  <span>
                    {index + 1}. {item.judul}
                  </span>
                  <span className="skm-required" aria-hidden="true">
                    *
                  </span>
                  <span className="skm-sr-only"> wajib diisi</span>
                </legend>
                <p className="skm-question-prompt">{item.pertanyaan}</p>
                <div className="skm-options">
                  {item.pilihan.map((pilihan, pilihanIndex) => (
                    <label className="skm-option" key={pilihan}>
                      <input
                        type="radio"
                        name={`unsur-${index + 1}`}
                        value={pilihanIndex + 1}
                        required
                      />
                      <span>{pilihan}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <section className="skm-card skm-suggestion-card">
              <label className="skm-field" htmlFor="saran">
                <span className="skm-suggestion-heading">
                  <span className="skm-heading-icon skm-heading-icon-green" aria-hidden="true">
                    3
                  </span>
                  <FieldLabel>10. Saran dan Masukan</FieldLabel>
                  <span className="skm-optional">Opsional</span>
                </span>
                <span className="skm-field-hint">
                  Ide, kritik, apresiasi, atau saran konstruktif untuk
                  pengembangan kualitas layanan Kecamatan Kuta Selatan ke
                  depannya.
                </span>
                <textarea
                  id="saran"
                  name="saran"
                  rows={4}
                  placeholder="Tuliskan saran atau masukan Anda"
                />
              </label>
            </section>

            <div className="skm-submit-area">
              {submitError && (
                <p className="skm-submit-error" role="alert">
                  {submitError}
                </p>
              )}
              <button className="skm-submit" type="submit" disabled={submitting}>
                {submitting ? "Mengirim survei..." : "Kirim Survei Kepuasan"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="skm-footnote">
              Terima kasih telah meluangkan waktu untuk memberikan penilaian
              demi kemajuan pelayanan publik di Kecamatan Kuta Selatan.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
