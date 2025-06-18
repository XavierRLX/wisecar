// hooks/useProfiles.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          username,
          email,
          avatar_url,
          is_admin,
          plan_id,
          plan_active,
          created_at,
          subscription_plans ( key, name )
        `)

      if (error) {
        console.error('Erro ao carregar perfis:', error.message)
      } else if (data) {
        const formatted = data.map(p => ({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          username: p.username,
          avatar_url: p.avatar_url,
          is_admin: p.is_admin ?? false,
          plan_id: p.plan_id,
          plan_active: p.plan_active,
          subscription_plan: p.subscription_plans?.[0] ?? { key: '', name: '' },
          created_at: p.created_at,
        }))
        setProfiles(formatted)
      }
      setLoading(false)
    })()
  }, [])

  return { profiles, setProfiles, loading }
}
