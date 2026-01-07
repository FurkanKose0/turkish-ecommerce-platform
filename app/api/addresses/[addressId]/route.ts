// Adres Silme API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const user = await requireAuth()
    const addressId = parseInt(params.addressId)

    if (isNaN(addressId)) {
      return NextResponse.json(
        { error: 'Geçersiz adres ID' },
        { status: 400 }
      )
    }

    // Adresin kullanıcıya ait olduğunu kontrol et
    const checkResult = await pool.query(
      'SELECT address_id FROM addresses WHERE address_id = $1 AND user_id = $2',
      [addressId, user.userId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Adres bulunamadı veya yetkiniz yok' },
        { status: 404 }
      )
    }

    // Adresi sil
    await pool.query(
      'DELETE FROM addresses WHERE address_id = $1 AND user_id = $2',
      [addressId, user.userId]
    )

    return NextResponse.json({ message: 'Adres silindi' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }
    console.error('Adres silme hatası:', error)
    return NextResponse.json(
      { error: 'Adres silinemedi' },
      { status: 500 }
    )
  }
}
