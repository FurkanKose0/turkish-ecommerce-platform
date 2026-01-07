// Guest session initialize endpoint
import { NextResponse } from 'next/server'
import { getOrCreateGuestSession } from '@/lib/guest-session'

export async function POST() {
  try {
    const sessionId = await getOrCreateGuestSession()
    return NextResponse.json({ sessionId, message: 'Session initialized' })
  } catch (error: any) {
    console.error('Session init hatası:', error)
    return NextResponse.json(
      { error: 'Session oluşturulamadı' },
      { status: 500 }
    )
  }
}
