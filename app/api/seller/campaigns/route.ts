import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

// Satıcının kampanyalarını getir
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await pool.query(
            `SELECT 
                c.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'product_id', p.product_id,
                            'product_name', p.product_name,
                            'image_url', p.image_url
                        )
                    ) FILTER (WHERE p.product_id IS NOT NULL), 
                    '[]'
                ) as products
            FROM campaigns c
            LEFT JOIN campaign_products cp ON c.campaign_id = cp.campaign_id
            LEFT JOIN products p ON cp.product_id = p.product_id
            WHERE c.seller_id = $1
            GROUP BY c.campaign_id
            ORDER BY c.created_at DESC`,
            [user.userId]
        )

        return NextResponse.json({ campaigns: result.rows })
    } catch (error: any) {
        console.error('Campaigns fetch error:', error)
        return NextResponse.json({ error: 'Kampanyalar yüklenemedi' }, { status: 500 })
    }
}

// Yeni kampanya oluştur
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            campaign_name,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            start_date,
            end_date,
            product_ids
        } = body

        // Validasyonlar
        if (!campaign_name || !discount_type || !discount_value || !start_date || !end_date) {
            return NextResponse.json({ error: 'Eksik alanlar mevcut' }, { status: 400 })
        }

        if (!product_ids || product_ids.length === 0) {
            return NextResponse.json({ error: 'En az bir ürün seçmelisiniz' }, { status: 400 })
        }

        // Seçilen ürünlerin satıcıya ait olduğunu kontrol et
        const productCheck = await pool.query(
            `SELECT product_id FROM products WHERE product_id = ANY($1) AND seller_id = $2`,
            [product_ids, user.userId]
        )

        if (productCheck.rows.length !== product_ids.length) {
            return NextResponse.json({ error: 'Sadece kendi ürünlerinizde kampanya oluşturabilirsiniz' }, { status: 403 })
        }

        // Kampanyayı oluştur
        const campaignResult = await pool.query(
            `INSERT INTO campaigns 
                (seller_id, campaign_name, description, discount_type, discount_value, 
                 min_order_amount, max_discount_amount, start_date, end_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                user.userId,
                campaign_name,
                description || null,
                discount_type,
                discount_value,
                min_order_amount || 0,
                max_discount_amount || null,
                start_date,
                end_date
            ]
        )

        const campaignId = campaignResult.rows[0].campaign_id

        // Kampanya ürünlerini ekle
        for (const productId of product_ids) {
            await pool.query(
                `INSERT INTO campaign_products (campaign_id, product_id) VALUES ($1, $2)`,
                [campaignId, productId]
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Kampanya başarıyla oluşturuldu',
            campaign: campaignResult.rows[0]
        })
    } catch (error: any) {
        console.error('Campaign create error:', error)
        return NextResponse.json({ error: 'Kampanya oluşturulamadı' }, { status: 500 })
    }
}
