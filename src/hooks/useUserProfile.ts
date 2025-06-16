// hooks/useUserProfile.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscription_plans ( key, name )
        `)
        .eq('id', user.id)
        .single()

      if (!error && data) setProfile(data as Profile)
      setLoading(false)
    })()
  }, [])

  return { profile, loading }
}
