'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preserve any query params like success=true
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'orders')

    router.replace(`/profile?${params.toString()}`)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181818] text-white">
      Yönlendiriliyor...
    </div>
  )
}
