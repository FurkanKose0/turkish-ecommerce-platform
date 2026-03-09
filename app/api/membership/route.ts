// Üyelik API
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const user = await requireAuth()

    // Kullanıcının üyelik durumunu kontrol et
    // Üyelik ürünü (product_id 999 veya 1000) sipariş edilmişse aktif sayılır
    const membershipQuery = `
      SELECT 
        o.order_id,
        o.order_date,
        oi.product_id,
        CASE 
          WHEN oi.product_id = 999 THEN 'monthly'
          WHEN oi.product_id = 1000 THEN 'yearly'
          ELSE NULL
        END as plan_type,
        CASE 
          WHEN oi.product_id = 999 THEN o.order_date + INTERVAL '1 month'
          WHEN oi.product_id = 1000 THEN o.order_date + INTERVAL '1 year'
          ELSE NULL
        END as expiry_date
      FROM orders o
      INNER JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1
        AND oi.product_id IN (999, 1000)
        AND o.status_id != 5 -- İptal edilmemiş
      ORDER BY o.order_date DESC
      LIMIT 1
    `

    const result = await pool.query(membershipQuery, [user.userId])

    if (result.rows.length > 0) {
      const membership = result.rows[0]
      const expiryDate = new Date(membership.expiry_date)
      const now = new Date()
      const isActive = expiryDate > now

      // Sync user table for consistency (Cart API uses this)
      await pool.query(
        'UPDATE users SET is_premium = $1, premium_expires_at = $2 WHERE user_id = $3',
        [isActive, expiryDate, user.userId]
      )

      return NextResponse.json({
        membership: {
          isActive,
          planType: membership.plan_type,
          expiryDate: membership.expiry_date,
          orderDate: membership.order_date,
        },
      })
    }

    // No membership found, ensure user table is consistent
    await pool.query(
      'UPDATE users SET is_premium = FALSE WHERE user_id = $1',
      [user.userId]
    )

    return NextResponse.json({
      membership: {
        isActive: false,
      },
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }
    console.error('Üyelik bilgisi hatası:', error)
    return NextResponse.json(
      { error: 'Üyelik bilgisi yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth()

    // Find active membership order to cancel
    const findOrderQuery = `
      SELECT o.order_id
      FROM orders o
      INNER JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1
        AND oi.product_id IN (999, 1000)
        AND o.status_id != 5
      ORDER BY o.order_date DESC
      LIMIT 1
    `
    const orderRes = await pool.query(findOrderQuery, [user.userId])

    if (orderRes.rows.length > 0) {
      const orderId = orderRes.rows[0].order_id

      // Cancel order
      await pool.query('UPDATE orders SET status_id = 5, cancellation_reason = $1 WHERE order_id = $2', ['Kullanıcı isteğiyle premium iptali', orderId])

      // Update user record
      await pool.query('UPDATE users SET is_premium = FALSE, premium_expires_at = NULL WHERE user_id = $1', [user.userId])

      return NextResponse.json({ success: true, message: 'Üyelik iptal edildi' })
    }

    return NextResponse.json({ error: 'Aktif üyelik bulunamadı' }, { status: 404 })

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Üyelik iptal hatası:', error)
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}
