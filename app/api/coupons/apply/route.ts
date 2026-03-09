import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        const { code, cartTotal } = await request.json()

        if (!code) {
            return NextResponse.json({ error: 'Kupon kodu gerekli' }, { status: 400 })
        }

        // Kuponu bul
        const couponQuery = `
      SELECT * FROM coupons 
      WHERE code = $1 AND is_active = TRUE AND expiry_date > CURRENT_TIMESTAMP
    `
        const couponResult = await pool.query(couponQuery, [code])

        if (couponResult.rows.length === 0) {
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kupon' }, { status: 400 })
        }

        const coupon = couponResult.rows[0]

        // Minimum sepet tutarı kontrolü
        if (cartTotal < Number(coupon.min_purchase)) {
            return NextResponse.json({
                error: `Bu kupon en az ${Number(coupon.min_purchase).toLocaleString('tr-TR')} TL tutarındaki sepetlerde geçerlidir.`
            }, { status: 400 })
        }

        // Kullanıcıya özel kupon kontrolü (eğer varsa)
        if (user) {
            const userCouponQuery = `
            SELECT * FROM user_coupons 
            WHERE user_id = $1 AND coupon_id = $2 AND is_used = FALSE
        `
            const userCouponResult = await pool.query(userCouponQuery, [user.userId, coupon.coupon_id])

            // Eğer sistemde kuponlar önce kullanıcıya tanımlanıyorsa bu kontrol aktif edilmeli.
            // Şimdilik genel kuponlara izin verelim ancak her kullanıcı genel kuponu 1 kere kullanabilsin.

            const usageCheckQuery = `
            SELECT * FROM user_coupons 
            WHERE user_id = $1 AND coupon_id = $2 AND is_used = TRUE
        `
            const usageCheckResult = await pool.query(usageCheckQuery, [user.userId, coupon.coupon_id])
            if (usageCheckResult.rows.length > 0) {
                return NextResponse.json({ error: 'Bu kuponu daha önce kullandınız' }, { status: 400 })
            }
        }

        let discountAmount = 0
        if (coupon.discount_type === 'PERCENT') {
            discountAmount = (cartTotal * Number(coupon.discount_value)) / 100
            if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
                discountAmount = Number(coupon.max_discount)
            }
        } else {
            discountAmount = Number(coupon.discount_value)
        }

        return NextResponse.json({
            success: true,
            discountAmount,
            couponId: coupon.coupon_id,
            code: coupon.code,
            message: 'Kupon başarıyla uygulandı!'
        })
    } catch (error: any) {
        console.error('Kupon uygulama hatası:', error)
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
    }
}
