import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

// Kupon detayını getir
export async function GET(
    request: NextRequest,
    { params }: { params: { couponId: string } }
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
            FROM seller_coupons c
            LEFT JOIN seller_coupon_products cp ON c.coupon_id = cp.coupon_id
            LEFT JOIN products p ON cp.product_id = p.product_id
            WHERE c.coupon_id = $1 AND c.seller_id = $2
            GROUP BY c.coupon_id`,
            [params.couponId, user.userId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Kupon bulunamadı' }, { status: 404 })
        }

        return NextResponse.json({ coupon: result.rows[0] })
    } catch (error: any) {
        console.error('Coupon fetch error:', error)
        return NextResponse.json({ error: 'Kupon yüklenemedi' }, { status: 500 })
    }
}

// Kuponu güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { couponId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            coupon_code,
            coupon_name,
            description,
            discount_type,
            discount_value,
            min_order_amount,
            max_discount_amount,
            usage_limit,
            per_user_limit,
            is_followers_only,
            start_date,
            end_date,
            is_active,
            product_ids
        } = body

        // Kuponun satıcıya ait olduğunu kontrol et
        const checkResult = await pool.query(
            `SELECT coupon_id FROM seller_coupons WHERE coupon_id = $1 AND seller_id = $2`,
            [params.couponId, user.userId]
        )

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: 'Kupon bulunamadı veya yetkiniz yok' }, { status: 404 })
        }

        // Kupon kodu benzersizliğini kontrol et (değiştirilmişse)
        if (coupon_code) {
            const codeCheck = await pool.query(
                `SELECT coupon_id FROM seller_coupons WHERE seller_id = $1 AND UPPER(coupon_code) = UPPER($2) AND coupon_id != $3`,
                [user.userId, coupon_code, params.couponId]
            )

            if (codeCheck.rows.length > 0) {
                return NextResponse.json({ error: 'Bu kupon kodu zaten kullanılıyor' }, { status: 400 })
            }
        }

        // Seçilen ürünlerin satıcıya ait olduğunu kontrol et
        if (product_ids && product_ids.length > 0) {
            const productCheck = await pool.query(
                `SELECT product_id FROM products WHERE product_id = ANY($1) AND seller_id = $2`,
                [product_ids, user.userId]
            )

            if (productCheck.rows.length !== product_ids.length) {
                return NextResponse.json({ error: 'Sadece kendi ürünlerinizde kupon oluşturabilirsiniz' }, { status: 403 })
            }
        }

        // Kuponu güncelle
        await pool.query(
            `UPDATE seller_coupons SET
                coupon_code = COALESCE(UPPER($1), coupon_code),
                coupon_name = COALESCE($2, coupon_name),
                description = COALESCE($3, description),
                discount_type = COALESCE($4, discount_type),
                discount_value = COALESCE($5, discount_value),
                min_order_amount = COALESCE($6, min_order_amount),
                max_discount_amount = COALESCE($7, max_discount_amount),
                usage_limit = COALESCE($8, usage_limit),
                per_user_limit = COALESCE($9, per_user_limit),
                is_followers_only = COALESCE($10, is_followers_only),
                start_date = COALESCE($11, start_date),
                end_date = COALESCE($12, end_date),
                is_active = COALESCE($13, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE coupon_id = $14`,
            [
                coupon_code,
                coupon_name,
                description,
                discount_type,
                discount_value,
                min_order_amount,
                max_discount_amount,
                usage_limit,
                per_user_limit,
                is_followers_only,
                start_date,
                end_date,
                is_active,
                params.couponId
            ]
        )

        // Ürünleri güncelle
        if (product_ids !== undefined) {
            // Mevcut ürünleri sil
            await pool.query(
                `DELETE FROM seller_coupon_products WHERE coupon_id = $1`,
                [params.couponId]
            )

            // Yeni ürünleri ekle
            if (product_ids && product_ids.length > 0) {
                for (const productId of product_ids) {
                    await pool.query(
                        `INSERT INTO seller_coupon_products (coupon_id, product_id) VALUES ($1, $2)`,
                        [params.couponId, productId]
                    )
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Kupon güncellendi' })
    } catch (error: any) {
        console.error('Coupon update error:', error)
        return NextResponse.json({ error: 'Kupon güncellenemedi' }, { status: 500 })
    }
}

// Kuponu sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { couponId: string } }
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await pool.query(
            `DELETE FROM seller_coupons WHERE coupon_id = $1 AND seller_id = $2 RETURNING *`,
            [params.couponId, user.userId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Kupon bulunamadı veya yetkiniz yok' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Kupon silindi' })
    } catch (error: any) {
        console.error('Coupon delete error:', error)
        return NextResponse.json({ error: 'Kupon silinemedi' }, { status: 500 })
    }
}
