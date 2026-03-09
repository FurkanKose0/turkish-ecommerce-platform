import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

// Kampanya detayını getir
export async function GET(
    request: NextRequest,
    { params }: { params: { campaignId: string } }
) {
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
            WHERE c.campaign_id = $1 AND c.seller_id = $2
            GROUP BY c.campaign_id`,
            [params.campaignId, user.userId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Kampanya bulunamadı' }, { status: 404 })
        }

        return NextResponse.json({ campaign: result.rows[0] })
    } catch (error: any) {
        console.error('Campaign fetch error:', error)
        return NextResponse.json({ error: 'Kampanya yüklenemedi' }, { status: 500 })
    }
}

// Kampanyayı güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { campaignId: string } }
) {
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
            is_active,
            product_ids
        } = body

        // Kampanyanın satıcıya ait olduğunu kontrol et
        const checkResult = await pool.query(
            `SELECT campaign_id FROM campaigns WHERE campaign_id = $1 AND seller_id = $2`,
            [params.campaignId, user.userId]
        )

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: 'Kampanya bulunamadı veya yetkiniz yok' }, { status: 404 })
        }

        // Seçilen ürünlerin satıcıya ait olduğunu kontrol et (eğer product_ids varsa)
        if (product_ids && product_ids.length > 0) {
            const productCheck = await pool.query(
                `SELECT product_id FROM products WHERE product_id = ANY($1) AND seller_id = $2`,
                [product_ids, user.userId]
            )

            if (productCheck.rows.length !== product_ids.length) {
                return NextResponse.json({ error: 'Sadece kendi ürünlerinizde kampanya oluşturabilirsiniz' }, { status: 403 })
            }
        }

        // Kampanyayı güncelle
        await pool.query(
            `UPDATE campaigns SET
                campaign_name = COALESCE($1, campaign_name),
                description = COALESCE($2, description),
                discount_type = COALESCE($3, discount_type),
                discount_value = COALESCE($4, discount_value),
                min_order_amount = COALESCE($5, min_order_amount),
                max_discount_amount = COALESCE($6, max_discount_amount),
                start_date = COALESCE($7, start_date),
                end_date = COALESCE($8, end_date),
                is_active = COALESCE($9, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE campaign_id = $10`,
            [
                campaign_name,
                description,
                discount_type,
                discount_value,
                min_order_amount,
                max_discount_amount,
                start_date,
                end_date,
                is_active,
                params.campaignId
            ]
        )

        // Ürünleri güncelle (eğer product_ids varsa)
        if (product_ids) {
            // Mevcut ürünleri sil
            await pool.query(
                `DELETE FROM campaign_products WHERE campaign_id = $1`,
                [params.campaignId]
            )

            // Yeni ürünleri ekle
            for (const productId of product_ids) {
                await pool.query(
                    `INSERT INTO campaign_products (campaign_id, product_id) VALUES ($1, $2)`,
                    [params.campaignId, productId]
                )
            }
        }

        return NextResponse.json({ success: true, message: 'Kampanya güncellendi' })
    } catch (error: any) {
        console.error('Campaign update error:', error)
        return NextResponse.json({ error: 'Kampanya güncellenemedi' }, { status: 500 })
    }
}

// Kampanyayı sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { campaignId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await pool.query(
            `DELETE FROM campaigns WHERE campaign_id = $1 AND seller_id = $2 RETURNING *`,
            [params.campaignId, user.userId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Kampanya bulunamadı veya yetkiniz yok' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Kampanya silindi' })
    } catch (error: any) {
        console.error('Campaign delete error:', error)
        return NextResponse.json({ error: 'Kampanya silinemedi' }, { status: 500 })
    }
}
