import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await pool.query(
            `SELECT 
         p.product_id, p.product_name, p.price, p.stock_quantity, p.image_url, 
         c.category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.seller_id = $1
       ORDER BY p.created_at DESC`,
            [user.userId]
        )

        return NextResponse.json({ products: result.rows })
    } catch (error) {
        console.error('Seller products error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
