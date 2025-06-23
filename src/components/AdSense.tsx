'use client'
import { useEffect } from 'react'

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
  useEffect(() => {
    ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
    ;(window as any).adsbygoogle.push({})
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-5598392740749077"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
