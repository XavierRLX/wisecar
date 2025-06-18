// hooks/useUserProfile.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscription_plans ( key, name )')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        const sub = data.subscription_plans?.[0] ?? { key: '', name: '' }
        setProfile({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          username: data.username,
          avatar_url: data.avatar_url,
          is_admin: data.is_admin ?? false,
          plan_id: data.plan_id,
          plan_active: data.plan_active,
          subscription_plan: sub,
          created_at: data.created_at,
        })
      }
      setLoading(false)
    })()
  }, [])

  return { profile, loading }
}
