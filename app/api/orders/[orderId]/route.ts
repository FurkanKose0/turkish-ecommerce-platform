// Sipariş Detay API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { getGuestSession } from '@/lib/guest-session'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await getCurrentUser()
    const guestSessionId = await getGuestSession()

    if (!user && !guestSessionId) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

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
        o.tracking_number,
        o.cargo_company,
        o.cancellation_reason,
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

    // Erişim kontrolü
    if (user) {
      // Müşteri sadece kendi siparişlerini görebilir
      if (user.roleId !== 1) {
        orderQuery += ' AND o.user_id = $2'
        orderParams.push(user.userId)
      }
    } else if (guestSessionId) {
      // Misafir sadece kendi session'ındaki siparişleri görebilir
      orderQuery += ' AND o.session_id = $2'
      orderParams.push(guestSessionId)
    }

    const orderResult = await pool.query(orderQuery, orderParams)

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    // Sipariş ürünlerini getir
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        oi.selected_size,
        p.product_id,
        p.product_name,
        p.image_url,
        p.sku
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.product_id
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
      { error: `Sipariş detayları yüklenemedi: ${error.message}` },
      { status: 500 }
    )
  }
}
// ... POST handler ...

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await getCurrentUser()
    const guestSessionId = await getGuestSession()

    if (!user && !guestSessionId) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 401 })
    }

    const { action, reason } = await request.json()
    const orderId = parseInt(params.orderId)

    if (action !== 'cancel') {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }

    // Check order status and ownership
    let checkQuery = 'SELECT status_id FROM orders WHERE order_id = $1'
    let checkParams: any[] = [orderId]

    if (user) {
      if (user.roleId !== 1) { // If not admin
        checkQuery += ' AND user_id = $2'
        checkParams.push(user.userId)
      }
    } else {
      checkQuery += ' AND session_id = $2'
      checkParams.push(guestSessionId)
    }

    const checkResult = await pool.query(checkQuery, checkParams)

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    const currentStatus = checkResult.rows[0].status_id

    // 1: Beklemede, 2: Onaylandı. Sipariş kargoya verildiyse (3), iptal edilemez.
    if (currentStatus > 2) {
      return NextResponse.json({ error: 'Bu sipariş artık iptal edilemez (Kargoya verilmiş veya tamamlanmış)' }, { status: 400 })
    }

    // Cancel the order
    await pool.query(
      'UPDATE orders SET status_id = 5, cancellation_reason = $1 WHERE order_id = $2',
      [reason || 'Kullanıcı tarafından iptal edildi', orderId]
    )

    return NextResponse.json({ success: true, message: 'Sipariş başarıyla iptal edildi' })

  } catch (error: any) {
    console.error('Sipariş güncelleme hatası:', error)
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}
