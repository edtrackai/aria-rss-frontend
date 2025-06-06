'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/cms/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/cms/ui/table';
import { Badge } from '@/components/cms/ui/badge';
import { Button } from '@/components/cms/ui/button';
import { Calendar, Download, FileText, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/cms/ui/progress';

interface Payout {
  id: string;
  payoutId: string;
  network: string;
  amount: number;
  currency: string;
  commissionCount: number;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  scheduledDate: Date;
  processedDate?: Date;
  paymentMethod: string;
  paymentReference?: string;
  taxAmount?: number;
  reportUrl?: string;
}

export function PayoutHistory() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearlyStats, setYearlyStats] = useState({
    totalPaid: 0,
    totalTax: 0,
    totalNet: 0,
    pendingPayouts: 0
  });

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/revenue/payouts');
      const data = await response.json();
      
      if (data.success) {
        setPayouts(data.data.payouts);
        setYearlyStats(data.data.yearlyStats);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (payoutId: string, reportUrl?: string) => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    } else {
      window.open(`/api/revenue/payouts/${payoutId}/report`, '_blank');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      scheduled: { 
        className: 'bg-blue-100 text-blue-800',
        icon: Calendar
      },
      processing: { 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      completed: { 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle2
      },
      failed: { 
        className: 'bg-red-100 text-red-800',
        icon: null
      }
    };

    const variant = variants[status] || variants.scheduled;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <span className="flex items-center gap-1">
          {Icon && <Icon className="w-3 h-3" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      amazon: '#FF9900',
      shareasale: '#0066CC',
      cj: '#6B46C1'
    };
    return colors[network] || '#6B7280';
  };

  const calculateTaxPercentage = (tax: number, gross: number) => {
    return gross > 0 ? (tax / gross) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Yearly Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid (YTD)</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(yearlyStats.totalPaid)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tax</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(yearlyStats.totalTax)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {calculateTaxPercentage(yearlyStats.totalTax, yearlyStats.totalPaid).toFixed(1)}% of gross
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(yearlyStats.totalNet)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(yearlyStats.pendingPayouts)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Network Distribution</CardTitle>
          <CardDescription>Payout breakdown by affiliate network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['amazon', 'shareasale', 'cj'].map((network) => {
              const networkPayouts = payouts.filter(p => p.network === network && p.status === 'completed');
              const networkTotal = networkPayouts.reduce((sum, p) => sum + p.amount, 0);
              const percentage = yearlyStats.totalPaid > 0 ? (networkTotal / yearlyStats.totalPaid) * 100 : 0;

              return (
                <div key={network} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{network}</span>
                    <span>{formatCurrency(networkTotal)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      '--progress-color': getNetworkColor(network) 
                    } as any}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payout History Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                All payouts from affiliate networks
              </CardDescription>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading payout history...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead className="text-right">Gross Amount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Net Amount</TableHead>
                  <TableHead>Commissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-sm">
                      {payout.payoutId}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        style={{ borderColor: getNetworkColor(payout.network) }}
                      >
                        {payout.network.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payout.amount, payout.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.taxAmount ? formatCurrency(payout.taxAmount, payout.currency) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payout.amount - (payout.taxAmount || 0), payout.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {payout.commissionCount} orders
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(new Date(payout.scheduledDate), 'MMM dd, yyyy')}</p>
                        {payout.processedDate && (
                          <p className="text-muted-foreground text-xs">
                            Paid: {format(new Date(payout.processedDate), 'MMM dd')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadReport(payout.payoutId, payout.reportUrl)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}