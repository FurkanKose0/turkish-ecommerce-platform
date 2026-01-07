// Ürünler API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    let query = `
      SELECT 
        p.product_id,
        p.product_name,
        p.description,
        p.price,
        p.stock_quantity,
        p.sku,
        p.image_url,
        p.is_active,
        c.category_id,
        c.category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = TRUE
    `
    const params: any[] = []
    let paramCount = 0

    if (categoryId) {
      paramCount++
      query += ` AND p.category_id = $${paramCount}`
      params.push(categoryId)
    }

    if (search) {
      paramCount++
      query += ` AND (p.product_name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      params.push(`%${search}%`)
    }

    query += ' ORDER BY p.product_name'

    const result = await pool.query(query, params)

    return NextResponse.json({ products: result.rows })
  } catch (error: any) {
    console.error('Ürün listeleme hatası:', error)
    return NextResponse.json(
      { error: 'Ürünler yüklenemedi' },
      { status: 500 }
    )
  }
}
