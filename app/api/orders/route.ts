// Siparişler API - Guest ve Authenticated kullanıcılar için
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { getGuestSession } from '@/lib/guest-session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Müşteri kendi siparişlerini görür, admin tüm siparişleri görür
    let query = `
      SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        o.tracking_code,
        os.status_name,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      INNER JOIN order_status os ON o.status_id = os.status_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
    `
    const params: any[] = []

    if (user.roleId !== 1) {
      // Müşteri
      query += ' WHERE o.user_id = $1'
      params.push(user.userId)
    }

    query += ' GROUP BY o.order_id, o.order_date, o.total_amount, os.status_name'
    query += ' ORDER BY o.order_date DESC'

    const result = await pool.query(query, params)

    return NextResponse.json({ orders: result.rows })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Siparişler yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()
    const { addressId, guestOrder, guestInfo } = body

    // Authenticated kullanıcı siparişi
    if (user && addressId) {
      // Stored procedure ile sipariş oluştur
      const result = await pool.query(
        'SELECT * FROM create_order($1, $2)',
        [user.userId, addressId]
      )

      const orderResult = result.rows[0]

      if (orderResult.p_status === 'ERROR') {
        return NextResponse.json(
          { error: orderResult.p_message },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: orderResult.p_message,
        orderId: orderResult.p_order_id,
      })
    }

    // Misafir siparişi
    if (guestOrder && guestInfo) {
      const sessionId = await getGuestSession()
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session bulunamadı' },
          { status: 400 }
        )
      }

      // Sepetteki ürünleri kontrol et ve toplam tutarı hesapla
      const cartResult = await pool.query(
        `SELECT c.product_id, c.quantity, p.price, p.stock_quantity, p.product_name
         FROM cart c
         INNER JOIN products p ON c.product_id = p.product_id
         WHERE c.session_id = $1`,
        [sessionId]
      )

      if (cartResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Sepetiniz boş!' },
          { status: 400 }
        )
      }

      let totalAmount = 0
      for (const item of cartResult.rows) {
        if (item.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Yetersiz stok: ${item.product_name} (Mevcut: ${item.stock_quantity}, İstenen: ${item.quantity})` },
            { status: 400 }
          )
        }
        totalAmount += item.price * item.quantity
      }

      // Sipariş oluştur
      const orderResult = await pool.query(
        `INSERT INTO orders (
          session_id, 
          guest_first_name, guest_last_name, guest_email, guest_phone,
          guest_address_line1, guest_address_line2, guest_city, guest_postal_code,
          total_amount, status_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1)
        RETURNING order_id`,
        [
          sessionId,
          guestInfo.firstName,
          guestInfo.lastName,
          guestInfo.email,
          guestInfo.phone || null,
          guestInfo.address.address_line1,
          guestInfo.address.address_line2 || null,
          guestInfo.address.city,
          guestInfo.address.postal_code,
          totalAmount,
        ]
      )

      const orderId = orderResult.rows[0].order_id

      // Sipariş detaylarını oluştur ve stok düşür
      for (const item of cartResult.rows) {
        // Sipariş detayı ekle
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
            item.price * item.quantity,
          ]
        )

        // Stok düşür
        await pool.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
          [item.quantity, item.product_id]
        )
      }

      // Sepeti temizle
      await pool.query('DELETE FROM cart WHERE session_id = $1', [sessionId])

      return NextResponse.json({
        message: `Sipariş başarıyla oluşturuldu. Sipariş No: ${orderId}`,
        orderId: orderId,
      })
    }

    return NextResponse.json(
      { error: 'Geçersiz istek' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Sipariş oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Sipariş oluşturulamadı' },
      { status: 500 }
    )
  }
}
