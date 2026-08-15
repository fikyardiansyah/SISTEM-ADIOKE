export default function AdminUsersPage() {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Kelola Akun</h1>
      <p className="text-gray-500">
        Halaman ini nantinya untuk mengelola akun admin (tambah, hapus, reset password).
        Butuh backend untuk autentikasi multi-user — saat ini login masih 1 akun tetap.
        (Segera hadir)
      </p>
    </div>
  );
}