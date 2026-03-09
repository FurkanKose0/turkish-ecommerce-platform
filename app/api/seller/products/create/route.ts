import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { product_name, category_id, price, stock_quantity, description, image_url, sku, sizes, size_stocks } = await request.json()

        // Insert new product
        const result = await pool.query(
            `INSERT INTO products 
       (product_name, category_id, price, stock_quantity, description, image_url, sku, seller_id, sizes, size_stocks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING product_id`,
            [product_name, category_id, price, stock_quantity, description, image_url, sku, user.userId, sizes, size_stocks ? JSON.stringify(size_stocks) : null]
        )

        return NextResponse.json({ success: true, productId: result.rows[0].product_id })
    } catch (error) {
        console.error('Create product error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
