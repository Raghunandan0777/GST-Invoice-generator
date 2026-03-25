import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, ...updates } = await req.json()
    if (!id) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })

    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, invoice: data })
  } catch (err) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
