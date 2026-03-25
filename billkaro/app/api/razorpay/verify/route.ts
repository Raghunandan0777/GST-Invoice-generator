import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json()

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Update user plan in DB
    await supabase.from('profiles').update({ plan: planId }).eq('id', user.id)

    return NextResponse.json({ success: true, plan: planId })
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
