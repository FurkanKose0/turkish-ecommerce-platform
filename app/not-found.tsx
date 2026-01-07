import Link from 'next/link'
import { FiHome } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-6xl font-bold text-gray-900 mb-4">404</h2>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Sayfa Bulunamadı</h3>
        <p className="text-gray-600 mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          <FiHome />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
