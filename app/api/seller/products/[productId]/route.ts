import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function PUT(
    request: Request,
    { params }: { params: { productId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { stock_quantity, image_url, price, sizes, size_stocks } = await request.json()
        const productId = params.productId

        // Verify ownership
        const ownershipCheck = await pool.query(
            'SELECT 1 FROM products WHERE product_id = $1 AND seller_id = $2',
            [productId, user.userId]
        )

        if (ownershipCheck.rows.length === 0) {
            return NextResponse.json({ error: 'Product not found or access denied' }, { status: 403 })
        }

        // Update
        await pool.query(
            `UPDATE products 
       SET stock_quantity = COALESCE($1, stock_quantity),
           image_url = COALESCE($2, image_url),
           price = COALESCE($3, price),
           sizes = $4,
           size_stocks = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $6`,
            [stock_quantity, image_url, price, sizes, size_stocks ? JSON.stringify(size_stocks) : null, productId]
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Update product error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: { productId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const productId = params.productId

        const result = await pool.query(
            `SELECT * FROM products WHERE product_id = $1 AND seller_id = $2`,
            [productId, user.userId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        return NextResponse.json({ product: result.rows[0] })
    } catch (error) {
        console.error('Get product error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
