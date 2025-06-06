"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRevenueData } from '@/hooks/dashboard/useRevenueData'
import { formatCurrency } from '@/lib/dashboard/chartHelpers'
import { useTheme } from '@/hooks/useTheme'
import { useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: {
      sources?: Record<string, number>
    }
  }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          Total: {formatCurrency(payload[0].value)}
        </p>
        {payload[0].payload.sources && (
          <div className="mt-2 space-y-1">
            {Object.entries(payload[0].payload.sources).map(([source, amount]: [string, any]) => (
              <p key={source} className="text-xs text-muted-foreground">
                {source}: {formatCurrency(amount)}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }
  return null
}

export function RevenueWidget() {
  const [days, setDays] = useState(7)
  const { data: revenue, isLoading, error } = useRevenueData(days)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const totalRevenue = revenue?.reduce((sum, item) => sum + item.amount, 0) || 0
  const avgRevenue = revenue?.length ? totalRevenue / revenue.length : 0

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load revenue data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Revenue Overview
            </CardTitle>
            <CardDescription>
              Track your earnings across all sources
            </CardDescription>
          </div>
          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">
                  Total revenue ({days} days)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium flex items-center gap-1 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  {formatCurrency(avgRevenue)}/day
                </p>
                <p className="text-xs text-muted-foreground">Average daily</p>
              </div>
            </div>

            {revenue && revenue.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                      fontSize={12}
                      tickFormatter={(value: any) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No revenue data yet</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}