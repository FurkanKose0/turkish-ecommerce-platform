// Admin Siparişler API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'

// Tüm siparişleri listele
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const searchParams = request.nextUrl.searchParams
    const statusId = searchParams.get('statusId')
    const search = searchParams.get('search')

    console.log('[API/Admin/Orders] Request params:', { statusId, search })

    // tracking_code sütununun var olup olmadığını kontrol et
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'tracking_code'
    `)
    const hasTrackingCode = columnCheck.rows.length > 0

    let query = `
      SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        o.status_id,
        ${hasTrackingCode ? 'o.tracking_code' : 'NULL as tracking_code'},
        o.shipped_date,
        o.delivered_date,
        os.status_name,
        COUNT(oi.order_item_id) as item_count,
        u.email as user_email,
        COALESCE(u.first_name || ' ' || u.last_name, '') as user_name,
        o.guest_email,
        COALESCE(o.guest_first_name || ' ' || o.guest_last_name, '') as guest_name
      FROM orders o
      INNER JOIN order_status os ON o.status_id = os.status_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE 1=1
    `
    const params: any[] = []
    let paramCount = 0

    if (statusId) {
      paramCount++
      query += ` AND o.status_id = $${paramCount}`
      params.push(parseInt(statusId))
    }

    if (search) {
      paramCount++
      const searchCondition = hasTrackingCode
        ? `(
          o.order_id::text ILIKE $${paramCount} OR
          COALESCE(u.email, '') ILIKE $${paramCount} OR
          COALESCE(o.guest_email, '') ILIKE $${paramCount} OR
          COALESCE(o.tracking_code, '') ILIKE $${paramCount}
        )`
        : `(
          o.order_id::text ILIKE $${paramCount} OR
          COALESCE(u.email, '') ILIKE $${paramCount} OR
          COALESCE(o.guest_email, '') ILIKE $${paramCount}
        )`
      query += ` AND ${searchCondition}`
      params.push(`%${search}%`)
    }

    const groupByFields = hasTrackingCode
      ? 'o.order_id, o.order_date, o.total_amount, o.status_id, o.tracking_code, o.shipped_date, o.delivered_date, os.status_name, u.email, u.first_name, u.last_name, o.guest_email, o.guest_first_name, o.guest_last_name'
      : 'o.order_id, o.order_date, o.total_amount, o.status_id, o.shipped_date, o.delivered_date, os.status_name, u.email, u.first_name, u.last_name, o.guest_email, o.guest_first_name, o.guest_last_name'
    
    query += ` GROUP BY ${groupByFields}`
    query += ' ORDER BY o.order_date DESC LIMIT 100'

    console.log('[API/Admin/Orders] Query:', query)
    console.log('[API/Admin/Orders] Params:', params)
    console.log('[API/Admin/Orders] Has tracking_code column:', hasTrackingCode)

    const result = await pool.query(query, params)
    console.log('[API/Admin/Orders] Result count:', result.rows.length)

    return NextResponse.json({ orders: result.rows })
  } catch (error: any) {
    console.error('[API/Admin/Orders] Error:', error)
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Siparişler yüklenemedi: ' + error.message },
      { status: 500 }
    )
  }
}
