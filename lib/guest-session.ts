  // Guest session yardımcı fonksiyonları
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import pool from './db'

const SESSION_COOKIE_NAME = 'guest_session_id'
const SESSION_DURATION_DAYS = 30

export async function getOrCreateGuestSession(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  // Mevcut session var mı kontrol et
  if (sessionId) {
    const sessionCheck = await pool.query(
      'SELECT session_id FROM guest_sessions WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP',
      [sessionId]
    )

    if (sessionCheck.rows.length > 0) {
      return sessionId
    }
  }

  // Yeni session oluştur
  sessionId = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  await pool.query(
    'INSERT INTO guest_sessions (session_id, expires_at) VALUES ($1, $2)',
    [sessionId, expiresAt]
  )

  // Cookie'ye kaydet
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
    path: '/',
  })

  return sessionId
}

export async function getGuestSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  // Session geçerli mi kontrol et
  const sessionCheck = await pool.query(
    'SELECT session_id FROM guest_sessions WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP',
    [sessionId]
  )

  if (sessionCheck.rows.length === 0) {
    return null
  }

  return sessionId
}
