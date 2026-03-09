// Kategoriler API
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Hiyerarşik kategori yapısını getir
    const result = await pool.query(`
      SELECT 
        category_id,
        category_name,
        parent_category_id,
        description,
        image_url
      FROM categories
      ORDER BY category_name ASC
    `)

    return NextResponse.json({ categories: result.rows })
  } catch (error: any) {
    console.error('Kategori listeleme hatası:', error)
    return NextResponse.json(
      { error: 'Kategoriler yüklenemedi' },
      { status: 500 }
    )
  }
}
