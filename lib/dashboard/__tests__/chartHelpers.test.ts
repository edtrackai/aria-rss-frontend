import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatShortDate,
  formatTime,
  calculatePercentageChange,
  generateTimeSeriesData,
  aggregateDataByPeriod,
  getChartColors,
  getGradientColors,
  smoothData,
  findTrendline,
  getChartTooltipFormatter,
  generateChartConfig,
} from '../chartHelpers'

describe('Chart Helpers', () => {
  describe('formatNumber', () => {
    it('should format numbers under 1000 as-is', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(42)).toBe('42')
      expect(formatNumber(999)).toBe('999')
    })

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1.0K')
      expect(formatNumber(1500)).toBe('1.5K')
      expect(formatNumber(25300)).toBe('25.3K')
      expect(formatNumber(999000)).toBe('999.0K')
    })

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1.0M')
      expect(formatNumber(2500000)).toBe('2.5M')
      expect(formatNumber(123456789)).toBe('123.5M')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1500)).toBe('-1.5K')
      expect(formatNumber(-2500000)).toBe('-2.5M')
    })

    it('should handle decimal inputs', () => {
      expect(formatNumber(1500.7)).toBe('1.5K')
      expect(formatNumber(2500000.8)).toBe('2.5M')
    })
  })

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(42)).toBe('$42.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format different currencies', () => {
      expect(formatCurrency(42, 'EUR')).toBe('€42.00')
      expect(formatCurrency(42, 'GBP')).toBe('£42.00')
      expect(formatCurrency(42, 'JPY')).toBe('¥42.00')
    })

    it('should handle negative amounts', () => {
      expect(formatCurrency(-42)).toBe('-$42.00')
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })

    it('should handle decimal precision', () => {
      expect(formatCurrency(42.999)).toBe('$43.00')
      expect(formatCurrency(42.001)).toBe('$42.00')
    })

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
    })
  })

  describe('formatPercentage', () => {
    it('should format positive percentages with + sign', () => {
      expect(formatPercentage(5.0)).toBe('+5.0%')
      expect(formatPercentage(25.5)).toBe('+25.5%')
      expect(formatPercentage(0.1)).toBe('+0.1%')
    })

    it('should format negative percentages without extra - sign', () => {
      expect(formatPercentage(-5.0)).toBe('-5.0%')
      expect(formatPercentage(-25.5)).toBe('-25.5%')
    })

    it('should format zero without sign', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })

    it('should respect decimal places parameter', () => {
      expect(formatPercentage(5.12345, 2)).toBe('+5.12%')
      expect(formatPercentage(5.12345, 0)).toBe('+5%')
      expect(formatPercentage(5.12345, 3)).toBe('+5.123%')
    })
  })

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2023-06-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toContain('Jun')
      expect(result).toContain('15')
      expect(result).toContain('2023')
    })

    it('should format date strings', () => {
      const result = formatDate('2023-06-15T10:30:00Z')
      expect(result).toContain('Jun')
      expect(result).toContain('15')
      expect(result).toContain('2023')
    })

    it('should handle different date formats', () => {
      expect(() => formatDate('2023-12-25')).not.toThrow()
      expect(() => formatDate('December 25, 2023')).not.toThrow()
    })
  })

  describe('formatShortDate', () => {
    it('should format Date objects without year', () => {
      const date = new Date('2023-06-15T10:30:00Z')
      const result = formatShortDate(date)
      expect(result).toContain('Jun')
      expect(result).toContain('15')
      expect(result).not.toContain('2023')
    })

    it('should format date strings without year', () => {
      const result = formatShortDate('2023-06-15T10:30:00Z')
      expect(result).toContain('Jun')
      expect(result).toContain('15')
      expect(result).not.toContain('2023')
    })
  })

  describe('formatTime', () => {
    it('should format time with AM/PM', () => {
      const date = new Date('2023-06-15T10:30:00Z')
      const result = formatTime(date)
      expect(result).toMatch(/\d+:\d{2}\s?(AM|PM)/i)
    })

    it('should format time from string', () => {
      const result = formatTime('2023-06-15T14:30:00Z')
      expect(result).toMatch(/\d+:\d{2}\s?(AM|PM)/i)
    })
  })

  describe('calculatePercentageChange', () => {
    it('should calculate positive percentage change', () => {
      expect(calculatePercentageChange(120, 100)).toBe(20)
      expect(calculatePercentageChange(150, 100)).toBe(50)
    })

    it('should calculate negative percentage change', () => {
      expect(calculatePercentageChange(80, 100)).toBe(-20)
      expect(calculatePercentageChange(50, 100)).toBe(-50)
    })

    it('should handle zero previous value', () => {
      expect(calculatePercentageChange(100, 0)).toBe(100)
      expect(calculatePercentageChange(0, 0)).toBe(0)
    })

    it('should handle same values', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0)
    })

    it('should handle decimal values', () => {
      expect(calculatePercentageChange(110.5, 100)).toBe(10.5)
    })
  })

  describe('generateTimeSeriesData', () => {
    beforeEach(() => {
      // Mock Math.random for consistent testing
      jest.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should generate correct number of data points', () => {
      const data = generateTimeSeriesData(7, 100)
      expect(data).toHaveLength(7)
    })

    it('should generate data with correct structure', () => {
      const data = generateTimeSeriesData(3, 100)
      
      data.forEach(point => {
        expect(point).toHaveProperty('date')
        expect(point).toHaveProperty('value')
        expect(typeof point.date).toBe('string')
        expect(typeof point.value).toBe('number')
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should generate dates in chronological order', () => {
      const data = generateTimeSeriesData(5, 100)
      
      for (let i = 1; i < data.length; i++) {
        const prevDate = new Date(data[i - 1].date)
        const currDate = new Date(data[i].date)
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime())
      }
    })

    it('should respect base value and variance', () => {
      const baseValue = 1000
      const variance = 0.2
      const data = generateTimeSeriesData(5, baseValue, variance)
      
      data.forEach(point => {
        const expectedMin = baseValue * (1 - variance / 2)
        const expectedMax = baseValue * (1 + variance / 2)
        expect(point.value).toBeGreaterThanOrEqual(expectedMin - 1) // Allow for rounding
        expect(point.value).toBeLessThanOrEqual(expectedMax + 1)
      })
    })

    it('should handle zero base value', () => {
      const data = generateTimeSeriesData(3, 0)
      expect(data).toHaveLength(3)
      data.forEach(point => {
        expect(point.value).toBe(0)
      })
    })
  })

  describe('aggregateDataByPeriod', () => {
    const sampleData = [
      { date: '2023-06-01', value: 100 },
      { date: '2023-06-02', value: 120 },
      { date: '2023-06-03', value: 110 },
      { date: '2023-06-08', value: 130 }, // Next week
      { date: '2023-06-09', value: 140 },
      { date: '2023-07-01', value: 200 }, // Next month
    ]

    it('should aggregate by day (no change)', () => {
      const result = aggregateDataByPeriod(sampleData, 'day')
      expect(result).toEqual(sampleData)
    })

    it('should aggregate by week', () => {
      const result = aggregateDataByPeriod(sampleData, 'week')
      expect(result.length).toBeLessThan(sampleData.length)
      
      // Should group dates by week start
      result.forEach(point => {
        expect(point).toHaveProperty('date')
        expect(point).toHaveProperty('value')
        expect(typeof point.value).toBe('number')
      })
    })

    it('should aggregate by month', () => {
      const result = aggregateDataByPeriod(sampleData, 'month')
      expect(result.length).toBeLessThanOrEqual(2) // June and July
      
      result.forEach(point => {
        expect(point.date).toMatch(/^\d{4}-\d{2}$/)
      })
    })

    it('should calculate average values for grouped periods', () => {
      const data = [
        { date: '2023-06-01', value: 100 },
        { date: '2023-06-02', value: 200 },
      ]
      
      const result = aggregateDataByPeriod(data, 'month')
      expect(result).toHaveLength(1)
      expect(result[0].value).toBe(150) // Average of 100 and 200
    })

    it('should handle empty data', () => {
      const result = aggregateDataByPeriod([], 'week')
      expect(result).toEqual([])
    })

    it('should handle single data point', () => {
      const data = [{ date: '2023-06-01', value: 100 }]
      const result = aggregateDataByPeriod(data, 'week')
      expect(result).toHaveLength(1)
      expect(result[0].value).toBe(100)
    })
  })

  describe('getChartColors', () => {
    it('should return color object with CSS variables', () => {
      const colors = getChartColors()
      
      expect(colors).toHaveProperty('primary')
      expect(colors).toHaveProperty('secondary')
      expect(colors).toHaveProperty('success')
      expect(colors).toHaveProperty('warning')
      expect(colors).toHaveProperty('danger')
      expect(colors).toHaveProperty('info')
      expect(colors).toHaveProperty('muted')
      
      expect(colors.primary).toBe('hsl(var(--primary))')
      expect(colors.success).toBe('hsl(142, 76%, 36%)')
    })

    it('should return consistent colors', () => {
      const colors1 = getChartColors()
      const colors2 = getChartColors()
      expect(colors1).toEqual(colors2)
    })
  })

  describe('getGradientColors', () => {
    it('should return gradient colors for known color names', () => {
      const primaryGradient = getGradientColors('primary')
      expect(primaryGradient).toHaveProperty('start')
      expect(primaryGradient).toHaveProperty('end')
      expect(primaryGradient.start).toBe('hsl(var(--primary))')
      expect(primaryGradient.end).toBe('hsla(var(--primary), 0.1)')
    })

    it('should return primary gradient for unknown colors', () => {
      const unknownGradient = getGradientColors('unknown')
      const primaryGradient = getGradientColors('primary')
      expect(unknownGradient).toEqual(primaryGradient)
    })

    it('should handle all predefined colors', () => {
      const colors = ['primary', 'success', 'warning', 'danger', 'info']
      
      colors.forEach(color => {
        const gradient = getGradientColors(color)
        expect(gradient).toHaveProperty('start')
        expect(gradient).toHaveProperty('end')
        expect(typeof gradient.start).toBe('string')
        expect(typeof gradient.end).toBe('string')
      })
    })
  })

  describe('smoothData', () => {
    const sampleData = [
      { date: '2023-01', value: 100 },
      { date: '2023-02', value: 200 },
      { date: '2023-03', value: 150 },
      { date: '2023-04', value: 300 },
      { date: '2023-05', value: 250 },
    ]

    it('should smooth data with default window size', () => {
      const result = smoothData(sampleData)
      expect(result).toHaveLength(sampleData.length)
      
      // Values should be smoothed but preserve structure
      result.forEach((point, index) => {
        expect(point.date).toBe(sampleData[index].date)
        expect(typeof point.value).toBe('number')
      })
    })

    it('should respect custom window size', () => {
      const result = smoothData(sampleData, 5)
      expect(result).toHaveLength(sampleData.length)
    })

    it('should return original data if window size exceeds data length', () => {
      const result = smoothData(sampleData, 10)
      expect(result).toEqual(sampleData)
    })

    it('should handle empty data', () => {
      const result = smoothData([])
      expect(result).toEqual([])
    })

    it('should handle single data point', () => {
      const data = [{ date: '2023-01', value: 100 }]
      const result = smoothData(data)
      expect(result).toEqual(data)
    })

    it('should calculate moving averages correctly', () => {
      const data = [
        { date: '1', value: 10 },
        { date: '2', value: 20 },
        { date: '3', value: 30 },
      ]
      
      const result = smoothData(data, 3)
      
      // First point: average of [10, 20, 30] = 20
      expect(result[0].value).toBe(20)
      // Second point: average of [10, 20, 30] = 20  
      expect(result[1].value).toBe(20)
      // Third point: average of [10, 20, 30] = 20
      expect(result[2].value).toBe(20)
    })
  })

  describe('findTrendline', () => {
    it('should calculate trendline for linear data', () => {
      const data = [
        { date: '1', value: 10 },
        { date: '2', value: 20 },
        { date: '3', value: 30 },
        { date: '4', value: 40 },
      ]
      
      const trendline = findTrendline(data)
      
      expect(trendline.slope).toBeCloseTo(10, 1)
      expect(trendline.r2).toBeCloseTo(1, 1) // Perfect linear correlation
    })

    it('should handle horizontal data', () => {
      const data = [
        { date: '1', value: 50 },
        { date: '2', value: 50 },
        { date: '3', value: 50 },
      ]
      
      const trendline = findTrendline(data)
      
      expect(trendline.slope).toBeCloseTo(0, 5)
      expect(trendline.intercept).toBeCloseTo(50, 1)
    })

    it('should handle empty or insufficient data', () => {
      expect(findTrendline([])).toEqual({ slope: 0, intercept: 0, r2: 0 })
      expect(findTrendline([{ date: '1', value: 10 }])).toEqual({ slope: 0, intercept: 0, r2: 0 })
    })

    it('should calculate negative slope for decreasing data', () => {
      const data = [
        { date: '1', value: 40 },
        { date: '2', value: 30 },
        { date: '3', value: 20 },
        { date: '4', value: 10 },
      ]
      
      const trendline = findTrendline(data)
      
      expect(trendline.slope).toBeLessThan(0)
      expect(trendline.r2).toBeCloseTo(1, 1)
    })

    it('should handle scattered data with lower R²', () => {
      const data = [
        { date: '1', value: 10 },
        { date: '2', value: 100 },
        { date: '3', value: 5 },
        { date: '4', value: 80 },
      ]
      
      const trendline = findTrendline(data)
      
      expect(trendline.r2).toBeLessThan(1)
      expect(trendline.r2).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getChartTooltipFormatter', () => {
    it('should return currency formatter', () => {
      const formatter = getChartTooltipFormatter('currency')
      expect(formatter(1234.56)).toBe('$1,234.56')
    })

    it('should return percentage formatter', () => {
      const formatter = getChartTooltipFormatter('percentage')
      expect(formatter(5.5)).toBe('+5.5%')
    })

    it('should return number formatter by default', () => {
      const formatter = getChartTooltipFormatter('number')
      expect(formatter(1500)).toBe('1.5K')
      
      const defaultFormatter = getChartTooltipFormatter('unknown' as any)
      expect(defaultFormatter(1500)).toBe('1.5K')
    })
  })

  describe('generateChartConfig', () => {
    it('should generate config with default options', () => {
      const config = generateChartConfig({})
      
      expect(config.responsive).toBe(true)
      expect(config.maintainAspectRatio).toBe(false)
      expect(config.animation.duration).toBe(750)
      expect(config.plugins.legend.display).toBe(true)
      expect(config.scales.x.grid.display).toBe(true)
      expect(config.scales.y.grid.display).toBe(true)
    })

    it('should respect custom options', () => {
      const config = generateChartConfig({
        responsive: false,
        maintainAspectRatio: true,
        showGrid: false,
        showLegend: false,
        animationDuration: 1000,
      })
      
      expect(config.responsive).toBe(false)
      expect(config.maintainAspectRatio).toBe(true)
      expect(config.animation.duration).toBe(1000)
      expect(config.plugins.legend.display).toBe(false)
      expect(config.scales.x.grid.display).toBe(false)
      expect(config.scales.y.grid.display).toBe(false)
    })

    it('should have correct legend position', () => {
      const config = generateChartConfig({ showLegend: true })
      expect(config.plugins.legend.position).toBe('top')
    })

    it('should handle partial options', () => {
      const config = generateChartConfig({ showGrid: false })
      
      expect(config.responsive).toBe(true) // Default
      expect(config.scales.x.grid.display).toBe(false) // Custom
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null and undefined values', () => {
      expect(() => formatNumber(null as any)).not.toThrow()
      expect(() => formatCurrency(undefined as any)).not.toThrow()
      expect(() => calculatePercentageChange(null as any, undefined as any)).not.toThrow()
    })

    it('should handle invalid dates', () => {
      expect(() => formatDate('invalid-date')).not.toThrow()
      expect(() => formatTime('not-a-date')).not.toThrow()
    })

    it('should handle extreme numbers', () => {
      expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBeDefined()
      expect(formatNumber(Number.MIN_SAFE_INTEGER)).toBeDefined()
      expect(formatCurrency(Number.MAX_SAFE_INTEGER)).toBeDefined()
    })

    it('should handle infinite and NaN values', () => {
      expect(() => formatNumber(Infinity)).not.toThrow()
      expect(() => formatNumber(NaN)).not.toThrow()
      expect(() => calculatePercentageChange(Infinity, 100)).not.toThrow()
    })
  })
})