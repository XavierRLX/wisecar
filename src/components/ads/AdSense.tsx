// components/AdSense.tsx
'use client'
import { useEffect, useRef } from 'react'

interface AdProps {
  slot: string
  style?: React.CSSProperties
  format?: string
}

export default function AdSense({
  slot,
  style = { display: 'block' },
  format = 'auto',
}: AdProps) {
  // agora usamos HTMLModElement, que é o tipo correto pro <ins>
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    const ins = adRef.current
    if (ins && ins.innerHTML.trim() !== '') return

    try {
      // @ts-ignore
      window.adsbygoogle = window.adsbygoogle || []
      // @ts-ignore
      window.adsbygoogle.push({})
    } catch (e) {
      console.warn('Adsense push error (ignorar se duplicado):', e)
    }
  }, [slot])

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-5598392740749077"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
