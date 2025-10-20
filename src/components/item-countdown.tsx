'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface ItemCountdownProps {
  endsAt: Date | string
  isExtended?: boolean
}

export function ItemCountdown({ endsAt, isExtended }: ItemCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(endsAt).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeRemaining('Closed')
        setIsUrgent(false)
        clearInterval(timer)
        return
      }

      const minutes = Math.floor(distance / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setIsUrgent(distance < 60000) // Last minute

      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [endsAt])

  if (!isExtended && timeRemaining === '') {
    return null
  }

  return (
    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow-md ${
      isUrgent 
        ? 'bg-red-600 text-white animate-pulse' 
        : isExtended
        ? 'bg-orange-600 text-white'
        : 'bg-gray-900/80 text-white'
    }`}>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{timeRemaining}</span>
      </div>
    </div>
  )
}

