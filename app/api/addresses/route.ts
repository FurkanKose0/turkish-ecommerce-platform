// Adresler API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const user = await requireAuth()

    const result = await pool.query(
      `SELECT address_id, address_line1, address_line2, city, postal_code, is_default
       FROM addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [user.userId]
    )

    return NextResponse.json({ addresses: result.rows })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Adresler yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { address_line1, address_line2, city, postal_code, is_default } = await request.json()

    if (!address_line1 || !city || !postal_code) {
      return NextResponse.json(
        { error: 'Adres satırı, şehir ve posta kodu zorunludur' },
        { status: 400 }
      )
    }

    // Eğer bu adres default olarak işaretleniyorsa, diğer adreslerin default'unu kaldır
    if (is_default) {
      await pool.query(
        `UPDATE addresses SET is_default = FALSE WHERE user_id = $1`,
        [user.userId]
      )
    }

    const result = await pool.query(
      `INSERT INTO addresses (user_id, address_line1, address_line2, city, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING address_id, address_line1, address_line2, city, postal_code, is_default`,
      [user.userId, address_line1, address_line2 || null, city, postal_code, is_default || false]
    )

    return NextResponse.json({
      message: 'Adres eklendi',
      address: result.rows[0],
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }
    console.error('Adres ekleme hatası:', error)
    return NextResponse.json(
      { error: 'Adres eklenemedi' },
      { status: 500 }
    )
  }
}
