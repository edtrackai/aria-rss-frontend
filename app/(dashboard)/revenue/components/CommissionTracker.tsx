'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/cms/ui/table';
import { Badge } from '@/components/cms/ui/badge';
import { Button } from '@/components/cms/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/cms/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/cms/ui/tabs';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

interface CommissionTrackerProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface Commission {
  id: string;
  transactionId: string;
  productName: string;
  network: string;
  orderAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled' | 'reversed';
  conversionTime: Date;
  approvalTime?: Date;
  paymentTime?: Date;
  clickId: string;
}

export function CommissionTracker({ dateRange }: CommissionTrackerProps) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterNetwork, setFilterNetwork] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    paid: 0,
    cancelled: 0,
    totalPending: 0,
    totalApproved: 0,
    totalPaid: 0
  });

  useEffect(() => {
    fetchCommissions();
  }, [dateRange, filterStatus, filterNetwork]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        status: filterStatus,
        network: filterNetwork
      });
      
      const response = await fetch(`/api/revenue/commissions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCommissions(data.data.commissions);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCommission = async (commissionId: string) => {
    try {
      const response = await fetch(`/api/revenue/commissions/${commissionId}/refresh`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchCommissions();
      }
    } catch (error) {
      console.error('Error refreshing commission:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
      case 'reversed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      reversed: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        <span className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  const filteredCommissions = commissions.filter(commission => {
    if (activeTab !== 'all' && commission.status !== activeTab) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(stats.totalPending)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(stats.totalApproved)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(0)}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Commission Details</CardTitle>
              <CardDescription>
                Track and manage your affiliate commissions
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
              <Button onClick={() => fetchCommissions()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="text-center py-8">Loading commissions...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead className="text-right">Order Amount</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-mono text-sm">
                          {commission.transactionId}
                        </TableCell>
                        <TableCell>{commission.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {commission.network.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(commission.orderAmount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(commission.commissionAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {commission.commissionRate.toFixed(2)}%
                        </TableCell>
                        <TableCell>{getStatusBadge(commission.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(commission.conversionTime), 'MMM dd, yyyy')}</p>
                            <p className="text-muted-foreground">
                              {format(new Date(commission.conversionTime), 'HH:mm')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => refreshCommission(commission.id)}
                            disabled={commission.status === 'paid' || commission.status === 'cancelled'}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}