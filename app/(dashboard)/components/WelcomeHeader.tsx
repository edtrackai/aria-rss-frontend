"use client"

import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

export function WelcomeHeader() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  
  const getGreeting = () => {
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Let's create something amazing today!",
      "Your content is making an impact!",
      "Ready to inspire your audience?",
      "Time to share your story with the world!",
      "Your dashboard is looking great today!",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold tracking-tight">
        {getGreeting()}, {user?.fullName || `${user?.firstName || 'Writer'} ${user?.lastName || ''}`.trim()}!
      </h1>
      <p className="text-muted-foreground mt-2">
        {getMotivationalMessage()} Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}.
      </p>
    </motion.div>
  )
}