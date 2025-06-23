// components/ads/AdsManager.tsx
'use client'
import { useState, useCallback } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import ConditionalAdSense from './ConditionalAdSense'
import ActionAdModal from './ActionAdModal'

interface AdsManagerProps {
  fixedSlot: string       // slot do AdSense para o bloco fixo
  actionSlot: string      // slot do AdSense para o modal
  onAction: () => void    // callback que faz sua “ação” (renda, redireciona, etc)
}

export default function AdsManager({
  fixedSlot,
  actionSlot,
  onAction,
}: AdsManagerProps) {
  const { profile, loading } = useUserProfile()
  const [showActionAd, setShowActionAd] = useState(false)

  const triggerActionAd = useCallback(() => {
    // só mostra o modal de ad pra plano free ativo
    if (profile?.subscription_plan.key === 'free' && profile.plan_active) {
      setShowActionAd(true)
    } else {
      // senão libera direto
      onAction()
    }
  }, [profile, onAction])

  const handleActionComplete = useCallback(() => {
    setShowActionAd(false)
    onAction()
  }, [onAction])

  if (loading) return null

  return (
    <>
      {/* bloco fixo em sidebar/footer, etc */}
      <ConditionalAdSense slot={fixedSlot} />

      {/* modal acionado pela ação */}
      {showActionAd && (
        <ActionAdModal
          slot={actionSlot}
          minDuration={7000}
          onComplete={handleActionComplete}
        />
      )}

      {/* exemplo de botão que dispara o fluxo */}
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={triggerActionAd}
      >
        Fazer minha ação com anúncio
      </button>
    </>
  )
}
