// Mevcut kullanıcı bilgilerini getir
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Giriş yapılmamış' },
        { status: 401 }
      )
    }

    const result = await pool.query(
      `SELECT user_id, email, first_name, last_name, role_id, is_premium
       FROM users
       WHERE user_id = $1`,
      [user.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        userId: result.rows[0].user_id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        roleId: result.rows[0].role_id,
        isPremium: result.rows[0].is_premium,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Hata oluştu' },
      { status: 500 }
    )
  }
}
