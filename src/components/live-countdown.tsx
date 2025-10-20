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
    <div className="flex items-center gap-2 md:gap-4">
      <Clock className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ${
        isUrgent ? 'text-red-400 animate-pulse' : 'text-white'
      }`} />
      <div className={`font-mono text-xl md:text-2xl font-bold tracking-wide whitespace-nowrap ${
        isUrgent ? 'text-red-400 animate-pulse' : 'text-white'
      }`}>
        {timeRemaining || '...'}
      </div>
      {isUrgent && (
        <span className="text-xs text-red-400 font-bold uppercase tracking-wider animate-pulse ml-2">
          Closing!
        </span>
      )}
    </div>
  )
}

