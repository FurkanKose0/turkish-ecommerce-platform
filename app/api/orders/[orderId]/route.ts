// Sipariş Detay API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await requireAuth()
    const orderId = parseInt(params.orderId)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Geçersiz sipariş ID' },
        { status: 400 }
      )
    }

    // Sipariş bilgilerini getir
    let orderQuery = `
      SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        o.tracking_code,
        o.shipped_date,
        o.delivered_date,
        os.status_name,
        os.status_id,
        a.address_line1,
        a.address_line2,
        a.city,
        a.postal_code,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        o.guest_first_name,
        o.guest_last_name,
        o.guest_email,
        o.guest_phone,
        o.guest_address_line1,
        o.guest_address_line2,
        o.guest_city,
        o.guest_postal_code
      FROM orders o
      INNER JOIN order_status os ON o.status_id = os.status_id
      LEFT JOIN addresses a ON o.address_id = a.address_id
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = $1
    `

    const orderParams: any[] = [orderId]

    // Müşteri sadece kendi siparişlerini görebilir
    if (user.roleId !== 1) {
      orderQuery += ' AND o.user_id = $2'
      orderParams.push(user.userId)
    }

    const orderResult = await pool.query(orderQuery, orderParams)

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    // Sipariş ürünlerini getir (satıcı bilgisi ile)
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        p.product_id,
        p.product_name,
        p.image_url,
        p.sku,
        p.seller_id,
        u_seller.first_name as seller_first_name,
        u_seller.last_name as seller_last_name,
        u_seller.email as seller_email
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN users u_seller ON p.seller_id = u_seller.user_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
    `

    const itemsResult = await pool.query(itemsQuery, [orderId])

    return NextResponse.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }
    console.error('Sipariş detay hatası:', error)
    return NextResponse.json(
      { error: 'Sipariş detayları yüklenemedi' },
      { status: 500 }
    )
  }
}
