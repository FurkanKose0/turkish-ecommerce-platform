import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { cookies } from 'next/headers'

// Kupon doğrulama ve uygulama
export async function POST(request: NextRequest) {
    try {
        const { coupon_code, seller_id, cart_total, product_ids } = await request.json()

        if (!coupon_code) {
            return NextResponse.json({ error: 'Kupon kodu gerekli' }, { status: 400 })
        }

        // Kullanıcı bilgisini al
        const user = await getCurrentUser()
        const cookieStore = cookies()
        const sessionId = cookieStore.get('session_id')?.value

        // Kuponu bul
        const couponQuery = `
            SELECT c.*, 
                   COALESCE(array_agg(cp.product_id) FILTER (WHERE cp.product_id IS NOT NULL), '{}') as applicable_product_ids,
                   u.first_name as seller_first_name,
                   u.last_name as seller_last_name
            FROM seller_coupons c
            LEFT JOIN seller_coupon_products cp ON c.coupon_id = cp.coupon_id
            LEFT JOIN users u ON c.seller_id = u.user_id
            WHERE UPPER(c.coupon_code) = UPPER($1)
              AND c.is_active = TRUE
              AND c.start_date <= NOW()
              AND c.end_date >= NOW()
            GROUP BY c.coupon_id, u.first_name, u.last_name
        `

        const couponResult = await pool.query(couponQuery, [coupon_code])

        if (couponResult.rows.length === 0) {
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kupon kodu' }, { status: 400 })
        }

        const coupon = couponResult.rows[0]

        // Belirli bir satıcı kontrolü (opsiyonel)
        if (seller_id && coupon.seller_id !== parseInt(seller_id)) {
            return NextResponse.json({
                error: 'Bu kupon sadece ' + coupon.seller_first_name + ' ' + coupon.seller_last_name + ' mağazasında geçerlidir'
            }, { status: 400 })
        }

        // Takipçilere özel kupon kontrolü
        if (coupon.is_followers_only) {
            if (!user) {
                return NextResponse.json({
                    error: 'Bu kupon sadece mağazayı takip eden üyelere özeldir. Lütfen giriş yapın.'
                }, { status: 400 })
            }

            const followCheck = await pool.query(
                `SELECT 1 FROM followed_stores WHERE user_id = $1 AND seller_id = $2`,
                [user.userId, coupon.seller_id]
            )

            if (followCheck.rows.length === 0) {
                return NextResponse.json({
                    error: 'Bu kupon sadece bu mağazayı takip eden müşterilere özeldir'
                }, { status: 400 })
            }
        }

        // Kullanım limiti kontrolü
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return NextResponse.json({ error: 'Bu kuponun kullanım limiti dolmuştur' }, { status: 400 })
        }

        // TEK KULLANIMLIK KONTROL - Kullanıcı bu kuponu daha önce kullanmış mı?
        if (user) {
            const userUsageCheck = await pool.query(
                `SELECT COUNT(*) as usage_count FROM seller_coupon_usages WHERE coupon_id = $1 AND user_id = $2`,
                [coupon.coupon_id, user.userId]
            )

            if (parseInt(userUsageCheck.rows[0].usage_count) > 0) {
                return NextResponse.json({
                    error: 'Bu kuponu daha önce kullandınız. Her kupon sadece bir kez kullanılabilir.'
                }, { status: 400 })
            }
        } else if (sessionId) {
            // Misafir kullanıcı için session bazlı kontrol
            const sessionUsageCheck = await pool.query(
                `SELECT COUNT(*) as usage_count FROM seller_coupon_usages WHERE coupon_id = $1 AND session_id = $2`,
                [coupon.coupon_id, sessionId]
            )

            if (parseInt(sessionUsageCheck.rows[0].usage_count) > 0) {
                return NextResponse.json({
                    error: 'Bu kuponu daha önce kullandınız. Her kupon sadece bir kez kullanılabilir.'
                }, { status: 400 })
            }
        }

        // Minimum sipariş tutarı kontrolü
        if (coupon.min_order_amount && cart_total < parseFloat(coupon.min_order_amount)) {
            return NextResponse.json({
                error: `Minimum sipariş tutarı: ${coupon.min_order_amount}₺`
            }, { status: 400 })
        }

        // Ürün uygunluğu kontrolü (eğer belirli ürünlerde geçerliyse)
        let applicableTotal = cart_total
        if (coupon.applicable_product_ids && coupon.applicable_product_ids.length > 0 && product_ids) {
            const matchingProducts = product_ids.filter((id: number) =>
                coupon.applicable_product_ids.includes(id)
            )

            if (matchingProducts.length === 0) {
                return NextResponse.json({
                    error: 'Sepetinizde bu kuponun geçerli olduğu ürün bulunmuyor'
                }, { status: 400 })
            }
        }

        // İndirim hesapla
        let discount = 0
        if (coupon.discount_type === 'percentage') {
            discount = (applicableTotal * parseFloat(coupon.discount_value)) / 100
            if (coupon.max_discount_amount && discount > parseFloat(coupon.max_discount_amount)) {
                discount = parseFloat(coupon.max_discount_amount)
            }
        } else {
            discount = parseFloat(coupon.discount_value)
        }

        if (discount > applicableTotal) {
            discount = applicableTotal
        }

        return NextResponse.json({
            success: true,
            coupon: {
                coupon_id: coupon.coupon_id,
                coupon_code: coupon.coupon_code,
                coupon_name: coupon.coupon_name,
                discount_type: coupon.discount_type,
                discount_value: parseFloat(coupon.discount_value),
                seller_id: coupon.seller_id,
                seller_name: `${coupon.seller_first_name} ${coupon.seller_last_name}`,
                is_followers_only: coupon.is_followers_only
            },
            discount_amount: Math.round(discount * 100) / 100,
            message: `${coupon.coupon_name} kuponu uygulandı!`
        })
    } catch (error: any) {
        console.error('Coupon validation error:', error)
        return NextResponse.json({ error: 'Kupon doğrulanamadı' }, { status: 500 })
    }
}
