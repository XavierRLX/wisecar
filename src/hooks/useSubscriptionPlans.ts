// hooks/useSubscriptionPlans.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SubscriptionPlan } from '@/types'

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Erro ao carregar planos:', error.message)
      } else if (data) {
        setPlans(data as SubscriptionPlan[])
      }
      setLoading(false)
    })()
  }, [])

  return { plans, loading }
}
