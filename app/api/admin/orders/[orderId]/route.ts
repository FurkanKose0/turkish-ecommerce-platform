// Admin Sipariş Güncelleme API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'

// Sipariş durumunu ve kargo kodunu güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await requireAdmin()
    
    const { statusId, trackingCode } = await request.json()
    const orderId = parseInt(params.orderId)

    if (!orderId) {
      return NextResponse.json(
        { error: 'Geçersiz sipariş ID' },
        { status: 400 }
      )
    }

    // Sipariş var mı kontrol et
    const orderCheck = await pool.query(
      'SELECT order_id, status_id FROM orders WHERE order_id = $1',
      [orderId]
    )

    if (orderCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      )
    }

    // Durum güncellemesi
    if (statusId) {
      // Durum geçerliliğini kontrol et
      const statusCheck = await pool.query(
        'SELECT status_id FROM order_status WHERE status_id = $1',
        [statusId]
      )

      if (statusCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Geçersiz durum ID' },
          { status: 400 }
        )
      }

      // Durum güncellemesi ve tarih ayarlama
      if (statusId === 3) {
        // Kargoya verildi
        await pool.query(
          `UPDATE orders 
           SET status_id = $1, shipped_date = CURRENT_TIMESTAMP, tracking_code = COALESCE($2, tracking_code)
           WHERE order_id = $3`,
          [statusId, trackingCode || null, orderId]
        )
      } else if (statusId === 4) {
        // Teslim edildi
        await pool.query(
          `UPDATE orders 
           SET status_id = $1, delivered_date = CURRENT_TIMESTAMP
           WHERE order_id = $2`,
          [statusId, orderId]
        )
      } else {
        // Diğer durumlar
        await pool.query(
          'UPDATE orders SET status_id = $1 WHERE order_id = $2',
          [statusId, orderId]
        )
      }
    } else if (trackingCode !== undefined) {
      // Sadece kargo kodu güncellemesi
      await pool.query(
        'UPDATE orders SET tracking_code = $1 WHERE order_id = $2',
        [trackingCode || null, orderId]
      )
    }

    // Güncellenmiş siparişi getir
    const result = await pool.query(
      `SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        o.status_id,
        o.tracking_code,
        o.shipped_date,
        o.delivered_date,
        os.status_name
      FROM orders o
      INNER JOIN order_status os ON o.status_id = os.status_id
      WHERE o.order_id = $1`,
      [orderId]
    )

    return NextResponse.json({
      message: 'Sipariş güncellendi',
      order: result.rows[0],
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }
    console.error('Sipariş güncelleme hatası:', error)
    return NextResponse.json(
      { error: 'Sipariş güncellenemedi' },
      { status: 500 }
    )
  }
}
