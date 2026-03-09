import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Satıcının aktif kuponlarını getir (müşteri için - ürün sayfası)
export async function GET(
    request: NextRequest,
    { params }: { params: { sellerId: string } }
) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        // Aktif ve geçerli tarihli kuponları getir
        const result = await pool.query(
            `SELECT 
                c.coupon_id,
                c.coupon_code,
                c.coupon_name,
                c.description,
                c.discount_type,
                c.discount_value,
                c.min_order_amount,
                c.max_discount_amount,
                c.is_followers_only,
                c.end_date,
                COALESCE(array_agg(cp.product_id) FILTER (WHERE cp.product_id IS NOT NULL), '{}') as product_ids
            FROM seller_coupons c
            LEFT JOIN seller_coupon_products cp ON c.coupon_id = cp.coupon_id
            WHERE c.seller_id = $1
              AND c.is_active = TRUE
              AND c.start_date <= NOW()
              AND c.end_date >= NOW()
              AND (c.usage_limit IS NULL OR c.usage_count < c.usage_limit)
            GROUP BY c.coupon_id
            ORDER BY c.is_followers_only ASC, c.discount_value DESC`,
            [params.sellerId]
        )

        // Ürüne özel kuponları filtrele (eğer productId varsa)
        let coupons = result.rows
        if (productId) {
            coupons = coupons.filter((coupon: any) => {
                // Eğer kupon belirli ürünlere uygulanıyorsa, ürünün listede olup olmadığını kontrol et
                if (coupon.product_ids && coupon.product_ids.length > 0) {
                    return coupon.product_ids.includes(parseInt(productId))
                }
                // Eğer ürün listesi boşsa, tüm ürünlerde geçerli
                return true
            })
        }

        return NextResponse.json({ coupons })
    } catch (error: any) {
        console.error('Seller coupons fetch error:', error)
        return NextResponse.json({ error: 'Kuponlar yüklenemedi' }, { status: 500 })
    }
}
