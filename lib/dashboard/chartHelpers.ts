/**
 * Chart helpers for dashboard components
 */

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function generateTimeSeriesData(
  days: number,
  baseValue: number,
  variance = 0.2
): Array<{ date: string; value: number }> {
  const data = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const randomFactor = 1 + (Math.random() - 0.5) * variance
    const value = Math.round(baseValue * randomFactor)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value,
    })
  }
  
  return data
}

export function aggregateDataByPeriod(
  data: Array<{ date: string; value: number }>,
  period: 'day' | 'week' | 'month'
): Array<{ date: string; value: number }> {
  const grouped = new Map<string, number[]>()
  
  data.forEach(({ date, value }) => {
    const d = new Date(date)
    let key: string
    
    switch (period) {
      case 'week':
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        key = date
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(value)
  })
  
  return Array.from(grouped.entries()).map(([date, values]) => ({
    date,
    value: values.reduce((sum, val) => sum + val, 0) / values.length,
  }))
}

export function getChartColors(): {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  info: string
  muted: string
} {
  return {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    danger: 'hsl(0, 84%, 60%)',
    info: 'hsl(199, 89%, 48%)',
    muted: 'hsl(var(--muted-foreground))',
  }
}

export function getGradientColors(color: string): {
  start: string
  end: string
} {
  const gradients: Record<string, { start: string; end: string }> = {
    primary: { start: 'hsl(var(--primary))', end: 'hsla(var(--primary), 0.1)' },
    success: { start: 'hsl(142, 76%, 36%)', end: 'hsla(142, 76%, 36%, 0.1)' },
    warning: { start: 'hsl(38, 92%, 50%)', end: 'hsla(38, 92%, 50%, 0.1)' },
    danger: { start: 'hsl(0, 84%, 60%)', end: 'hsla(0, 84%, 60%, 0.1)' },
    info: { start: 'hsl(199, 89%, 48%)', end: 'hsla(199, 89%, 48%, 0.1)' },
  }
  
  return gradients[color] || gradients.primary
}

export function smoothData(
  data: Array<{ date: string; value: number }>,
  windowSize = 3
): Array<{ date: string; value: number }> {
  if (data.length < windowSize) return data
  
  return data.map((item, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2))
    const end = Math.min(data.length, start + windowSize)
    
    const window = data.slice(start, end)
    const smoothedValue = window.reduce((sum, d) => sum + d.value, 0) / window.length
    
    return {
      ...item,
      value: Math.round(smoothedValue),
    }
  })
}

export function findTrendline(
  data: Array<{ date: string; value: number }>
): { slope: number; intercept: number; r2: number } {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }
  
  const x = data.map((_, i) => i)
  const y = data.map(d => d.value)
  
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  // Calculate R²
  const yMean = sumY / n
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept
    return sum + Math.pow(yi - predicted, 2)
  }, 0)
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const r2 = 1 - (ssRes / ssTot)
  
  return { slope, intercept, r2 }
}

export function getChartTooltipFormatter(
  type: 'currency' | 'number' | 'percentage'
) {
  return (value: number) => {
    switch (type) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      default:
        return formatNumber(value)
    }
  }
}

export function generateChartConfig(options: {
  responsive?: boolean
  maintainAspectRatio?: boolean
  showGrid?: boolean
  showLegend?: boolean
  animationDuration?: number
}) {
  const {
    responsive = true,
    maintainAspectRatio = false,
    showGrid = true,
    showLegend = true,
    animationDuration = 750,
  } = options
  
  return {
    responsive,
    maintainAspectRatio,
    animation: {
      duration: animationDuration,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        grid: {
          display: showGrid,
        },
      },
      y: {
        grid: {
          display: showGrid,
        },
      },
    },
  }
}