// components/ConditionalAdSense.tsx
'use client'
import { useUserProfile } from '@/hooks/useUserProfile'
import AdSense from './AdSense'

interface ConditionalAdProps {
  slot: string
  style?: React.CSSProperties
  format?: string
}

export default function ConditionalAdSense({
  slot,
  style,
  format,
}: ConditionalAdProps) {
  const { profile, loading } = useUserProfile()

  if (loading) return null
  if (!profile || !profile.plan_active) return null
  if (profile.is_admin) return null
  if (profile.subscription_plan.key !== 'free') return null

  return (
    <div className="w-full my-4">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Anúncio</h3>
      <AdSense slot={slot} style={style} format={format} />
    </div>
  )
}
