'use client'
import { useEffect, useState } from 'react'
import AdSense from './AdSense'
import { X } from 'lucide-react'

interface ActionAdModalProps {
  slot: string            // slot do AdSense (imagem/responsive)
  onComplete: () => void  // callback quando terminar o anúncio
  minDuration?: number    // tempo mínimo em ms (default = 5000)
  videoUrl?: string       // se quiser exibir vídeo em vez de AdSense
}

export default function ActionAdModal({
  slot,
  onComplete,
  minDuration = 5000,
  videoUrl,
}: ActionAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(minDuration)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1000))
    }, 1000)

    const timeout = setTimeout(() => {
      setReady(true)
      clearInterval(interval)
    }, minDuration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [minDuration])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full relative">
        {ready && (
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            onClick={onComplete}
          >
            <X />
          </button>
        )}

        <h3 className="text-lg font-bold mb-2 text-center">Anúncio</h3>

        <div className="flex justify-center mb-4">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls={false}
              autoPlay
              muted
              className="max-h-64"
            />
          ) : (
            <AdSense slot={slot} style={{ display: 'block' }} />
          )}
        </div>

        <div className="text-center">
          {!ready ? (
            <p>Aguarde {Math.ceil(timeLeft / 1000)}s para continuar…</p>
          ) : (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={onComplete}
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
