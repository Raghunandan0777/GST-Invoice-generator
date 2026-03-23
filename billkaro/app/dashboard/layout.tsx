import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <DashboardSidebar user={user} profile={profile} />
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
