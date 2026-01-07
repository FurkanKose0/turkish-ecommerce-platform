// Admin Raporlar API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin()
    const searchParams = request.nextUrl.searchParams
    const reportType = searchParams.get('type') || 'revenue'

    let result

    switch (reportType) {
      case 'top-products':
        result = await pool.query('SELECT * FROM v_top_selling_products LIMIT 10')
        return NextResponse.json({ data: result.rows })

      case 'monthly-revenue':
        result = await pool.query('SELECT * FROM v_monthly_revenue')
        return NextResponse.json({ data: result.rows })

      case 'category-sales':
        result = await pool.query('SELECT * FROM v_category_sales')
        return NextResponse.json({ data: result.rows })

      case 'low-stock':
        result = await pool.query('SELECT * FROM v_low_stock_products')
        return NextResponse.json({ data: result.rows })

      default:
        return NextResponse.json(
          { error: 'Geçersiz rapor tipi' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Yetkiniz yok' },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Rapor yüklenemedi' },
      { status: 500 }
    )
  }
}
