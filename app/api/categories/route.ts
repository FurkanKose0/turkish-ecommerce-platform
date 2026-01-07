// Kategoriler API
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // Hiyerarşik kategori yapısını getir
    const result = await pool.query(`
      WITH RECURSIVE category_tree AS (
        SELECT 
          category_id,
          category_name,
          parent_category_id,
          description,
          0 as level
        FROM categories
        WHERE parent_category_id IS NULL
        
        UNION ALL
        
        SELECT 
          c.category_id,
          c.category_name,
          c.parent_category_id,
          c.description,
          ct.level + 1
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_category_id = ct.category_id
      )
      SELECT * FROM category_tree
      ORDER BY level, category_name
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
