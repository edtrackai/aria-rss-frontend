'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/cms/ui/table';
import { Badge } from '@/components/cms/ui/badge';
import { Button } from '@/components/cms/ui/button';
import { Input } from '@/components/cms/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/cms/ui/select';
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/cms/ui/progress';

interface TopProductsProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface Product {
  productId: string;
  productName: string;
  network: string;
  revenue: number;
  conversions: number;
  clicks: number;
  conversionRate: number;
  averageOrderValue: number;
  trend: number; // percentage change from previous period
}

export function TopProducts({ dateRange }: TopProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    fetchTopProducts();
  }, [dateRange]);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/revenue/top-products?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNetwork = filterNetwork === 'all' || product.network === filterNetwork;
      return matchesSearch && matchesNetwork;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'conversions':
          return b.conversions - a.conversions;
        case 'conversionRate':
          return b.conversionRate - a.conversionRate;
        default:
          return 0;
      }
    });

  const maxRevenue = Math.max(...products.map(p => p.revenue), 1);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getNetworkBadgeColor = (network: string) => {
    switch (network) {
      case 'amazon':
        return 'bg-orange-100 text-orange-800';
      case 'shareasale':
        return 'bg-blue-100 text-blue-800';
      case 'cj':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>
              Products ranked by revenue and performance metrics
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            <Select value={filterNetwork} onValueChange={setFilterNetwork}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All networks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All networks</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="shareasale">ShareASale</SelectItem>
                <SelectItem value="cj">CJ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="conversionRate">Conversion Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Network</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
                <TableHead className="text-right">AOV</TableHead>
                <TableHead className="text-right">Trend</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{product.productName}</p>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getNetworkBadgeColor(product.network)}>
                      {product.network.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.conversions}
                    <span className="text-muted-foreground text-sm">
                      {' '}/ {product.clicks}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.conversionRate.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.averageOrderValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIcon(product.trend)}
                      <span className={product.trend > 0 ? 'text-green-600' : product.trend < 0 ? 'text-red-600' : ''}>
                        {Math.abs(product.trend).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}