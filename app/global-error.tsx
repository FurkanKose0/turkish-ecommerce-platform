'use client'

import { useEffect } from 'react'
import { FiAlertCircle } from 'react-icons/fi'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="tr">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kritik Hata</h2>
            <p className="text-gray-600 mb-6">
              Uygulamada kritik bir hata oluştu. Lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={reset}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
