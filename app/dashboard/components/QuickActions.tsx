"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card'
import { Button } from '@/components/cms/ui/button'
import { 
  FileText, 
  Star, 
  BarChart, 
  PlusCircle,
  Edit,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const actions = [
  {
    title: 'Write Article',
    description: 'Create new content',
    icon: FileText,
    color: 'bg-blue-500',
    href: '/dashboard/articles/new',
  },
  {
    title: 'Write Review',
    description: 'Review a product',
    icon: Star,
    color: 'bg-purple-500',
    href: '/dashboard/reviews/new',
  },
  {
    title: 'View Analytics',
    description: 'Check performance',
    icon: BarChart,
    color: 'bg-green-500',
    href: '/dashboard/analytics',
  },
]

export function QuickActions() {
  const router = useRouter()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Start creating content or check your stats
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4"
              onClick={() => router.push(action.href)}
            >
              <div className={cn("p-2 rounded-lg mr-4", action.color)}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}