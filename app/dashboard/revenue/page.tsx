'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RevenueChart } from './components/RevenueChart';
import { TopProducts } from './components/TopProducts';
import { CommissionTracker } from './components/CommissionTracker';
import { PayoutHistory } from './components/PayoutHistory';
import { LinkManager } from './components/LinkManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/cms/ui/tabs';
import { DateRangePicker } from '@/components/cms/ui/date-range-picker';
import type { DateRange } from '@/components/cms/ui/date-range-picker';
import { Button } from '@/components/cms/ui/button';
import { Download, TrendingUp, DollarSign, MousePointer, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

interface RevenueMetrics {
  totalRevenue: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  averageOrderValue: number;
  revenuePerClick: number;
}

export default function RevenueDashboard() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    // Map URL tab parameter to actual tab value
    const tabMapping: { [key: string]: string } = {
      'products': 'products',
      'links': 'links',
      'payouts': 'payouts',
      'analytics': 'products', // analytics redirects to products tab
    };
    return tabMapping[tabFromUrl || ''] || 'overview';
  });

  useEffect(() => {
    fetchRevenueMetrics();
  }, [dateRange]);

  const fetchRevenueMetrics = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      const mockMetrics: RevenueMetrics = {
        totalRevenue: 12847.50,
        totalClicks: 3456,
        totalConversions: 142,
        conversionRate: 4.11,
        averageOrderValue: 90.47,
        revenuePerClick: 3.72
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMetrics(mockMetrics);
      
      // Uncomment when backend is ready
      // const response = await fetch(
      //   `/api/revenue/metrics?startDate=${dateRange.from?.toISOString()}&endDate=${dateRange.to?.toISOString()}`
      // );
      // const data = await response.json();
      // if (data.success) {
      //   setMetrics(data.data);
      // }
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      // Set mock data even on error for development
      setMetrics({
        totalRevenue: 12847.50,
        totalClicks: 3456,
        totalConversions: 142,
        conversionRate: 4.11,
        averageOrderValue: 90.47,
        revenuePerClick: 3.72
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTaxReport = async () => {
    const year = new Date().getFullYear();
    window.open(`/api/revenue/tax-report/${year}?download=true`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">
            Track your affiliate revenue and performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range || { from: undefined, to: undefined })}
            className="w-[300px]"
          />
          <Button onClick={downloadTaxReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Tax Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(metrics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatNumber(metrics?.totalClicks || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '...' : formatCurrency(metrics?.revenuePerClick || 0)} per click
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatNumber(metrics?.totalConversions || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '...' : `${metrics?.conversionRate.toFixed(2)}%`} conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(metrics?.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Daily revenue for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart dateRange={{ 
                start: dateRange.from || new Date(), 
                end: dateRange.to || new Date() 
              }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <TopProducts dateRange={{ 
            start: dateRange.from || new Date(), 
            end: dateRange.to || new Date() 
          }} />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <CommissionTracker dateRange={{ 
            start: dateRange.from || new Date(), 
            end: dateRange.to || new Date() 
          }} />
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <LinkManager />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <PayoutHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}