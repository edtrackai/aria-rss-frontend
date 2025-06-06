'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/cms/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/cms/ui/tabs';
import { format } from 'date-fns';

interface RevenueChartProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface ChartData {
  date: string;
  revenue: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

export function RevenueChart({ dateRange }: RevenueChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area');
  const [metric, setMetric] = useState('revenue');

  useEffect(() => {
    fetchChartData();
  }, [dateRange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/revenue/chart-data?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-semibold">{format(new Date(label), 'MMM dd, yyyy')}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name === 'Revenue' 
                  ? formatCurrency(entry.value)
                  : entry.name === 'Conversion Rate'
                  ? `${entry.value.toFixed(2)}%`
                  : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return <div className="h-[400px] flex items-center justify-center">Loading...</div>;
    }

    const chartConfig = {
      revenue: { color: '#10b981', label: 'Revenue' },
      clicks: { color: '#3b82f6', label: 'Clicks' },
      conversions: { color: '#f59e0b', label: 'Conversions' },
      conversionRate: { color: '#8b5cf6', label: 'Conversion Rate' }
    };

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM dd')}
            />
            <YAxis 
              tickFormatter={metric === 'revenue' ? formatCurrency : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {metric === 'all' ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={chartConfig.revenue.color} 
                  fill={chartConfig.revenue.color}
                  fillOpacity={0.6}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke={chartConfig.conversions.color} 
                  fill={chartConfig.conversions.color}
                  fillOpacity={0.6}
                  name="Conversions"
                  yAxisId="right"
                />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke={chartConfig[metric as keyof typeof chartConfig].color} 
                fill={chartConfig[metric as keyof typeof chartConfig].color}
                fillOpacity={0.6}
                name={chartConfig[metric as keyof typeof chartConfig].label}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM dd')}
            />
            <YAxis 
              tickFormatter={metric === 'revenue' ? formatCurrency : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {metric === 'all' ? (
              <>
                <Bar 
                  dataKey="revenue" 
                  fill={chartConfig.revenue.color}
                  name="Revenue"
                />
                <Bar 
                  dataKey="conversions" 
                  fill={chartConfig.conversions.color}
                  name="Conversions"
                />
              </>
            ) : (
              <Bar 
                dataKey={metric} 
                fill={chartConfig[metric as keyof typeof chartConfig].color}
                name={chartConfig[metric as keyof typeof chartConfig].label}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
          />
          <YAxis 
            tickFormatter={metric === 'revenue' ? formatCurrency : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {metric === 'all' ? (
            <>
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={chartConfig.revenue.color}
                strokeWidth={2}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke={chartConfig.conversions.color}
                strokeWidth={2}
                name="Conversions"
                yAxisId="right"
              />
            </>
          ) : (
            <Line 
              type="monotone" 
              dataKey={metric} 
              stroke={chartConfig[metric as keyof typeof chartConfig].color}
              strokeWidth={2}
              name={chartConfig[metric as keyof typeof chartConfig].label}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="clicks">Clicks</SelectItem>
              <SelectItem value="conversions">Conversions</SelectItem>
              <SelectItem value="conversionRate">Conversion Rate</SelectItem>
              <SelectItem value="all">All Metrics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {renderChart()}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">
              {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="text-2xl font-bold">
              {data.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Conversions</p>
            <p className="text-2xl font-bold">
              {data.reduce((sum, item) => sum + item.conversions, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Conversion Rate</p>
            <p className="text-2xl font-bold">
              {data.length > 0 
                ? `${(data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length).toFixed(2)}%`
                : '0%'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}