import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

// Satıcının kuponlarını getir
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
                ) as products,
                (SELECT COUNT(*) FROM followed_stores WHERE seller_id = $1) as follower_count
            FROM seller_coupons c
            LEFT JOIN seller_coupon_products cp ON c.coupon_id = cp.coupon_id
            LEFT JOIN products p ON cp.product_id = p.product_id
            WHERE c.seller_id = $1
            GROUP BY c.coupon_id
            ORDER BY c.created_at DESC`,
            [user.userId]
        )

        return NextResponse.json({ coupons: result.rows })
    } catch (error: any) {
        console.error('Coupons fetch error:', error)
        return NextResponse.json({ error: 'Kuponlar yüklenemedi' }, { status: 500 })
    }
}

// Yeni kupon oluştur
export async function POST(request: NextRequest) {
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
            product_ids // Boş ise tüm satıcı ürünlerinde geçerli
        } = body

        // Validasyonlar
        if (!coupon_code || !coupon_name || !discount_type || !discount_value || !start_date || !end_date) {
            return NextResponse.json({ error: 'Eksik alanlar mevcut' }, { status: 400 })
        }

        // Kupon kodu benzersizliğini kontrol et (satıcı bazında)
        const codeCheck = await pool.query(
            `SELECT coupon_id FROM seller_coupons WHERE seller_id = $1 AND UPPER(coupon_code) = UPPER($2)`,
            [user.userId, coupon_code]
        )

        if (codeCheck.rows.length > 0) {
            return NextResponse.json({ error: 'Bu kupon kodu zaten kullanılıyor' }, { status: 400 })
        }

        // Seçilen ürünlerin satıcıya ait olduğunu kontrol et (eğer product_ids varsa)
        if (product_ids && product_ids.length > 0) {
            const productCheck = await pool.query(
                `SELECT product_id FROM products WHERE product_id = ANY($1) AND seller_id = $2`,
                [product_ids, user.userId]
            )

            if (productCheck.rows.length !== product_ids.length) {
                return NextResponse.json({ error: 'Sadece kendi ürünlerinizde kupon oluşturabilirsiniz' }, { status: 403 })
            }
        }

        // Kuponu oluştur
        const couponResult = await pool.query(
            `INSERT INTO seller_coupons 
                (seller_id, coupon_code, coupon_name, description, discount_type, discount_value, 
                 min_order_amount, max_discount_amount, usage_limit, per_user_limit, 
                 is_followers_only, start_date, end_date)
             VALUES ($1, UPPER($2), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING *`,
            [
                user.userId,
                coupon_code,
                coupon_name,
                description || null,
                discount_type,
                discount_value,
                min_order_amount || 0,
                max_discount_amount || null,
                usage_limit || null,
                per_user_limit || 1,
                is_followers_only || false,
                start_date,
                end_date
            ]
        )

        const couponId = couponResult.rows[0].coupon_id

        // Kupon ürünlerini ekle (eğer product_ids varsa)
        if (product_ids && product_ids.length > 0) {
            for (const productId of product_ids) {
                await pool.query(
                    `INSERT INTO seller_coupon_products (coupon_id, product_id) VALUES ($1, $2)`,
                    [couponId, productId]
                )
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Kupon başarıyla oluşturuldu',
            coupon: couponResult.rows[0]
        })
    } catch (error: any) {
        console.error('Coupon create error:', error)
        return NextResponse.json({ error: 'Kupon oluşturulamadı' }, { status: 500 })
    }
}
