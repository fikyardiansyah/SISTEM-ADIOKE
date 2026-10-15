import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type SVGProps } from "react";
import { ambilProfilAdmin, getAdminSession, gantiPasswordAdmin, simpanProfilAdmin } from "../lib/auth";

type IconProps = SVGProps<SVGSVGElement>;
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconIdCard(props: IconProps) {
  return <svg {...iconProps} {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="12" r="2" /><path d="M6 16.5c.5-1.5 1.8-2.5 2.5-2.5s2 1 2.5 2.5M14 9h5M14 12.5h5M14 16h3.5" /></svg>;
}

function IconShield(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.7 7.5 9 4.3-1.3 7.5-4.5 7.5-9V6L12 3Z" /></svg>;
}

function inisial(nama: string) {
  return nama.split(/\s+/).filter(Boolean).slice(0, 2).map((bagian) => bagian[0]).join("").toUpperCase();
}

export default function AdminProfilPage() {
  const session = getAdminSession();
  const [nama, setNama] = useState(session?.user.nama ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [nip, setNip] = useState("");
  const [nomorTelepon, setNomorTelepon] = useState("");
  const [fotoProfil, setFotoProfil] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [memuat, setMemuat] = useState(true);
  const [menyimpanProfil, setMenyimpanProfil] = useState(false);
  const [pesanProfil, setPesanProfil] = useState("");
  const [errorProfil, setErrorProfil] = useState("");
  const [passwordSaatIni, setPasswordSaatIni] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [menyimpanPassword, setMenyimpanPassword] = useState(false);
  const [pesanPassword, setPesanPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  useEffect(() => {
    let active = true;
    ambilProfilAdmin()
      .then((profile) => {
        if (!active) return;
        setNama(profile.nama);
        setEmail(profile.email);
        setNip(profile.nip ?? "");
        setNomorTelepon(profile.nomorTelepon ?? "");
        setFotoProfil(profile.fotoProfil ?? null);
      })
      .catch((error: unknown) => {
        if (active) setErrorProfil(error instanceof Error ? error.message : "Profil gagal dimuat.");
      })
      .finally(() => {
        if (active) setMemuat(false);
      });
    return () => { active = false; };
  }, []);

  const handlePilihFoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorProfil("Pilih file gambar untuk foto profil.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorProfil("Ukuran foto maksimal 10 MB sebelum diproses.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        bitmap.close();
        throw new Error("Browser tidak dapat memproses foto.");
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      setFotoProfil(canvas.toDataURL("image/jpeg", 0.82));
      setErrorProfil("");
      setPesanProfil("Foto dipilih. Klik Simpan Perubahan untuk menyimpannya.");
    } catch (error) {
      setErrorProfil(error instanceof Error ? error.message : "Foto gagal diproses.");
    }
  };

  const handleSimpanProfil = async (event: FormEvent) => {
    event.preventDefault();
    setPesanProfil("");
    setErrorProfil("");
    setMenyimpanProfil(true);
    try {
      const updated = await simpanProfilAdmin({
        nama: nama.trim(),
        email: email.trim(),
        nip: nip.trim(),
        nomorTelepon: nomorTelepon.trim(),
        fotoProfil,
      });
      setNama(updated.nama);
      setEmail(updated.email);
      setNip(updated.nip ?? "");
      setNomorTelepon(updated.nomorTelepon ?? "");
      setFotoProfil(updated.fotoProfil ?? null);
      setPesanProfil("Profil berhasil disimpan.");
    } catch (error) {
      setErrorProfil(error instanceof Error ? error.message : "Profil gagal disimpan.");
    } finally {
      setMenyimpanProfil(false);
    }
  };

  const handleGantiPassword = async (event: FormEvent) => {
    event.preventDefault();
    setErrorPassword("");
    setPesanPassword("");
    if (passwordBaru.length < 8) {
      setErrorPassword("Password baru minimal 8 karakter.");
      return;
    }
    if (passwordBaru !== konfirmasiPassword) {
      setErrorPassword("Konfirmasi password baru tidak sama.");
      return;
    }

    setMenyimpanPassword(true);
    try {
      await gantiPasswordAdmin(passwordSaatIni, passwordBaru);
      setPasswordSaatIni("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
      setPesanPassword("Password berhasil diperbarui.");
    } catch (error) {
      setErrorPassword(error instanceof Error ? error.message : "Password gagal diperbarui.");
    } finally {
      setMenyimpanPassword(false);
    }
  };

  if (!session) return null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <p className="text-sm text-gray-400">Akun <span className="mx-1">›</span> Kelola Profil</p>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Profil</h1>
      </div>

      <section className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xl font-bold text-white">
            {fotoProfil ? (
              <img src={fotoProfil} alt={`Foto profil ${nama || session.user.nama}`} className="h-full w-full object-cover" />
            ) : (
              inisial(nama || session.user.nama)
            )}
          </div>
          <button
            type="button"
            onClick={() => fotoInputRef.current?.click()}
            aria-label="Pilih foto profil"
            className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow ring-2 ring-white hover:bg-blue-700"
          >
            Ubah
          </button>
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => void handlePilihFoto(event)}
            className="hidden"
          />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-lg font-bold text-gray-900">{nama || session.user.nama}</p>
          <p className="text-sm text-gray-500">{session.user.peran} · @{session.user.username}</p>
          <p className="text-sm text-gray-500">{email || session.user.email}</p>
          {fotoProfil && (
            <button
              type="button"
              onClick={() => {
                setFotoProfil(null);
                setPesanProfil("Foto akan dihapus saat menyimpan perubahan.");
              }}
              className="mt-1 text-xs font-medium text-red-600 hover:underline"
            >
              Hapus foto
            </button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSimpanProfil} className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
            <IconIdCard className="h-5 w-5 text-blue-600" />
            Informasi Profil
          </h2>
          {memuat ? (
            <p className="text-sm text-gray-500">Memuat profil...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-gray-600">
                  Nama Lengkap
                  <input
                    value={nama}
                    onChange={(event) => setNama(event.target.value)}
                    required
                    maxLength={150}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="text-sm font-medium text-gray-600">
                  Nomor Induk Pegawai (NIP)
                  <input
                    value={nip}
                    onChange={(event) => setNip(event.target.value)}
                    maxLength={30}
                    placeholder="Belum diisi"
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="text-sm font-medium text-gray-600">
                  Alamat Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={254}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="text-sm font-medium text-gray-600">
                  Nomor Telepon
                  <input
                    type="tel"
                    value={nomorTelepon}
                    onChange={(event) => setNomorTelepon(event.target.value)}
                    maxLength={30}
                    placeholder="+62 8xx-xxxx-xxxx"
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>
              {errorProfil && <p className="mt-4 text-sm font-medium text-red-600" role="alert">{errorProfil}</p>}
              {pesanProfil && <p className="mt-4 text-sm font-medium text-green-600" role="status">{pesanProfil}</p>}
              <button
                type="submit"
                disabled={menyimpanProfil}
                className="mt-5 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
              >
                {menyimpanProfil ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </>
          )}
        </form>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
            <IconShield className="h-5 w-5 text-blue-600" />
            Keamanan Akun
          </h2>
          <form onSubmit={handleGantiPassword} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-600">
              Password Saat Ini
              <input
                type="password"
                value={passwordSaatIni}
                onChange={(event) => setPasswordSaatIni(event.target.value)}
                autoComplete="current-password"
                required
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm font-medium text-gray-600">
              Password Baru
              <input
                type="password"
                value={passwordBaru}
                onChange={(event) => setPasswordBaru(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Minimal 8 karakter"
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </label>
            <label className="text-sm font-medium text-gray-600">
              Konfirmasi Password Baru
              <input
                type="password"
                value={konfirmasiPassword}
                onChange={(event) => setKonfirmasiPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="Ketik ulang password baru"
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </label>
            {errorPassword && <p className="text-sm font-medium text-red-600" role="alert">{errorPassword}</p>}
            {pesanPassword && <p className="text-sm font-medium text-green-600" role="status">{pesanPassword}</p>}
            <button
              type="submit"
              disabled={menyimpanPassword}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              {menyimpanPassword ? "Memperbarui..." : "Perbarui Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
