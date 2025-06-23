// components/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Menu as MenuIcon,
  Car as CarIcon,
  PlusCircle as AddIcon,
  MessageSquare as ChatIcon,
  Cog as ServicesIcon,
} from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'
import ActionAdModal from '@/components/ads/ActionAdModal'

interface BottomNavProps {
  onMenuClick: () => void
}

export default function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading } = useUserProfile()

  const [showAd, setShowAd] = useState(false)

  const isActive = (route: string) => pathname === route

  // disparado ao clicar em “Adicionar”
  const handleAddClick = () => {
    if (loading) return
    // só exibe o modal se for plano free e ativo
    if (profile?.plan_active && profile.subscription_plan.key === 'free') {
      setShowAd(true)
    } else {
      router.push('/veiculos/novo')
    }
  }

  // quando o anúncio terminar
  const handleAdComplete = () => {
    setShowAd(false)
    router.push('/veiculos/novo')
  }

  const navItems = [
    {
      label: 'Menu',
      Icon: MenuIcon,
      onClick: () => {
        window.scrollTo(0, 0)
        onMenuClick()
      },
    },
    { href: '/veiculos/todosVeiculos', label: 'Veículos', Icon: CarIcon },
    // aqui não usamos href, mas onClick
    { label: 'Adicionar', Icon: AddIcon, onClick: handleAddClick },
    { href: '/lojas', label: 'Serviços', Icon: ServicesIcon },
    { href: '/chat', label: 'Chat', Icon: ChatIcon },
  ]

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-md z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center h-16 px-4">
          {navItems.map(({ href, label, Icon, onClick }) => {
            const active = href ? isActive(href) : false
            const colorClass = active ? 'text-blue-500' : 'TextColorPrimary'

            const commonProps = {
              className: `flex flex-col items-center justify-center ${colorClass} hover:text-secondary transition`,
              'aria-label': label,
              onClick,
            } as any

            return href ? (
              <Link key={label} href={href} {...commonProps}>
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs">{label}</span>
              </Link>
            ) : (
              <button key={label} type="button" {...commonProps}>
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* só exibe o modal de anúncio se showAd for true */}
      {showAd && (
        <ActionAdModal
          slot="SEU_ACTION_SLOT_ID"
          minDuration={7000}      // tempo mínimo em ms
          onComplete={handleAdComplete}
        />
      )}
    </>
  )
}
