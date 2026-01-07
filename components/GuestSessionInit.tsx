'use client'

import { useEffect } from 'react'

export default function GuestSessionInit() {
  useEffect(() => {
    // Sayfa yüklendiğinde guest session'ı initialize et
    const initGuestSession = async () => {
      try {
        await fetch('/api/guest/init', {
          method: 'POST',
          credentials: 'include', // Cookie'lerin gönderilmesi için
        })
      } catch (error) {
        // Sessizce devam et
        console.error('Guest session init hatası:', error)
      }
    }

    initGuestSession()
  }, [])

  return null // Bu component görsel bir şey render etmez
}
