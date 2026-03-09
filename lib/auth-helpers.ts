// Server-side auth helper fonksiyonları
import { cookies } from 'next/headers'
import { verifyToken } from './auth'

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  return decoded
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.roleId !== 1) {
    throw new Error('Forbidden - Admin access required')
  }
  return user
}
