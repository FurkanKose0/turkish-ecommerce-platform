// Kullanıcı Giriş API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const result = await pool.query(
      `SELECT user_id, email, password_hash, first_name, last_name, role_id, is_active
       FROM users
       WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      )
    }

    const user = result.rows[0]

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Hesabınız deaktif edilmiş' },
        { status: 403 }
      )
    }

    // Şifre kontrolü
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Token oluştur
    const token = generateToken(user.user_id, user.role_id)

    // Cookie'ye token kaydet
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/', // Tüm path'lerde geçerli
    })

    console.log('[Login] Token oluşturuldu, roleId:', user.role_id, 'userId:', user.user_id)

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roleId: user.role_id,
      },
    })
  } catch (error: any) {
    console.error('Giriş hatası:', error)
    return NextResponse.json(
      { error: 'Giriş işlemi başarısız' },
      { status: 500 }
    )
  }
}
