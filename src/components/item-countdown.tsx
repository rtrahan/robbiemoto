'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface ItemCountdownProps {
  endsAt: Date | string
  isExtended?: boolean
  inline?: boolean
}

export function ItemCountdown({ endsAt, isExtended, inline }: ItemCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date().getTime()
      const end = new Date(endsAt).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeRemaining('Closed')
        setIsUrgent(false)
        return false
      }

      const hours = Math.floor(distance / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setIsUrgent(distance < 60000)

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
      return true
    }
    
    const shouldContinue = updateTime()
    if (!shouldContinue) return
    
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [endsAt])

  if (!timeRemaining) return null

  if (inline) {
    return (
      <span className={`text-[10px] sm:text-[11px] font-mono font-semibold tabular-nums ${
        isUrgent
          ? 'text-red-600 animate-pulse'
          : isExtended
          ? 'text-orange-600'
          : 'text-gray-500'
      }`}>
        {timeRemaining}
      </span>
    )
  }

  return (
    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow-md z-10 ${
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
