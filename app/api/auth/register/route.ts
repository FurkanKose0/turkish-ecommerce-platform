// Kullanıcı Kayıt API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    // Validasyon
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    // Email kontrolü
    const emailCheck = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    )

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Şifreyi hash'le
    const passwordHash = await hashPassword(password)

    // Kullanıcıyı oluştur (role_id = 2: Müşteri)
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id)
       VALUES ($1, $2, $3, $4, $5, 2)
       RETURNING user_id, email, first_name, last_name, role_id`,
      [email, passwordHash, firstName, lastName, phone || null]
    )

    const user = result.rows[0]

    return NextResponse.json(
      {
        message: 'Kayıt başarılı',
        user: {
          userId: user.user_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          roleId: user.role_id,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Kayıt hatası:', error)
    
    // Veritabanı bağlantı hatası
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: 'Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      )
    }
    
    // Duplicate key hatası (email zaten var)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }
    
    // Foreign key hatası (role_id yok)
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Sistem hatası. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Kayıt işlemi başarısız',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
