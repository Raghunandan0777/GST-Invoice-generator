import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { planId, amount } = await req.json()

    // Initialize Razorpay (install: npm i razorpay)
    // const Razorpay = require('razorpay')
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID!,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET!,
    // })

    // const order = await razorpay.orders.create({
    //   amount: amount * 100, // paise
    //   currency: 'INR',
    //   receipt: `order_${user.id}_${Date.now()}`,
    //   notes: { userId: user.id, planId },
    // })

    // return NextResponse.json({ orderId: order.id })

    // Placeholder until Razorpay is set up:
    return NextResponse.json({ orderId: 'order_placeholder', planId, amount })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
