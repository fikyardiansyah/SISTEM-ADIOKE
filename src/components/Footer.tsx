export default function Footer() {
  return (
    <footer className="bg-blue-700 text-white text-center py-10 px-4 mt-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Kecamatan Kuta Selatan</h2>
        <p className="mt-1 text-sm text-blue-100">Jl. Kampus UNUD, Jimbaran</p>
        <p className="text-sm text-blue-100">
          <a href="tel:0361704670" className="hover:underline">0361-704670</a>,{' '}
          <a href="tel:03614725180" className="hover:underline">0361-4725180</a>
        </p>
        <p className="text-sm text-blue-100">umumkutsel@yahoo.com</p>
        <p className="text-sm text-blue-100 mb-6">pedas.kutaselatan@gmail.com</p>

        {/* Sosial Media Icons (Menggunakan SVG murni, bebas eror) */}
        <div className="flex justify-center items-center gap-4 mb-6">
          
          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.581 9 4.615V8z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>

          {/* Website */}
          <a href="https://kutaselatankec.badungkab.go.id" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 2.05c3.545.39 6.36 3.205 6.75 6.75h-6.75V2.05zm-2 0v6.75H4.25c.39-3.545 3.205-6.36 6.75-6.75zM4.25 10.25h7.75v7.75c-3.545-.39-6.36-3.205-6.75-6.75zm9.75 7.75v-7.75h7.75c-.39 3.545-3.205 6.36-6.75 6.75zm6.75-9.75h-6.75V2.05c3.545.39 6.36 3.205 6.75 6.75zm-15.5 0h6.75V2.05c-3.545.39-6.36 3.205-6.75 6.75z"/>
            </svg>
          </a>

        </div>

        <p className="text-xs text-blue-200 opacity-90">© Copyright 2026 Kecamatan kuta selatan</p>
      </div>
    </footer>
  );
}