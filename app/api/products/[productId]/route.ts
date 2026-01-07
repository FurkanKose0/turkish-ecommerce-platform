// Ürün Detay API
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = parseInt(params.productId)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Geçersiz ürün ID' },
        { status: 400 }
      )
    }

    // Ürün bilgilerini getir
    const productQuery = `
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
        c.category_name,
        c.parent_category_id
      FROM products p
      INNER JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = $1 AND p.is_active = TRUE
    `

    const result = await pool.query(productQuery, [productId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product: result.rows[0] })
  } catch (error: any) {
    console.error('Ürün detay hatası:', error)
    return NextResponse.json(
      { error: 'Ürün detayları yüklenemedi' },
      { status: 500 }
    )
  }
}
