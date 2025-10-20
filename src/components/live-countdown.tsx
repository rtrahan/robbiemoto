'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function LiveCountdown({ endsAt }: { endsAt: Date | string }) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(endsAt).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeRemaining('Ended')
        setIsUrgent(false)
        clearInterval(timer)
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      // Set urgent mode for last minute
      setIsUrgent(distance < 60000) // Less than 1 minute

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endsAt])

  return (
    <div className={`flex items-center gap-1.5 md:gap-3 ${isUrgent ? 'animate-pulse' : ''}`}>
      <Clock className={`h-3.5 w-3.5 md:h-4 md:w-4 text-white flex-shrink-0 ${isUrgent ? 'animate-pulse' : ''}`} />
      <div className={`font-mono text-lg md:text-2xl font-bold tracking-tight md:tracking-wide whitespace-nowrap ${
        isUrgent ? 'text-red-300 animate-pulse' : 'text-white'
      }`}>
        {timeRemaining || '...'}
      </div>
      {isUrgent && (
        <span className="text-xs text-red-300 font-bold animate-pulse hidden md:inline">
          CLOSING SOON!
        </span>
      )}
    </div>
  )
}

