import { useState, useEffect } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  
  // Fetch health status
  const { data: health, error: healthError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/health`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );
  
  // Fetch metrics
  const { data: metrics, error: metricsError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/metrics/current`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );
  
  // Fetch summary report
  const { data: summary, error: summaryError } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/metrics/summary`,
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❔';
    }
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Prepare chart data
  const categoryData = metrics ? Object.entries(metrics.analysis.categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  const sourceData = metrics ? Object.entries(metrics.rss.sourceMetrics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count })) : [];

  const retailerData = metrics ? Object.entries(metrics.uk.retailerMentions).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    mentions: value
  })) : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>ARIA Dashboard - AI-Reviewed.com</title>
        <meta name="description" content="System monitoring dashboard for ARIA RSS Aggregator" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 ARIA System Dashboard
          </h1>
          <p className="text-gray-600">
            Monitoring UK's Most Trusted Tech Authority
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          
          {healthError ? (
            <div className="text-red-600">Failed to load health status</div>
          ) : !health ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">{getStatusIcon(health.status)}</span>
                <span className={`text-xl font-semibold ${getStatusColor(health.status)}`}>
                  {health.status.toUpperCase()}
                </span>
                <span className="text-gray-500 ml-4">
                  Last check: {new Date(health.timestamp).toLocaleTimeString('en-GB')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(health.services || {}).map(([service, status]) => (
                  <div key={service} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{service}</span>
                      <span>{getStatusIcon(status.status)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {status.responseTime ? `${status.responseTime}ms` : status.details?.error || 'OK'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Articles Today</h3>
            <div className="text-3xl font-bold text-blue-600">
              {metrics?.generation.articlesGenerated || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Target: 2 per day
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">UK Focus Rate</h3>
            <div className="text-3xl font-bold text-green-600">
              {summary?.trends.ukFocusPercentage || 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              British content priority
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">RSS Sources</h3>
            <div className="text-3xl font-bold text-purple-600">
              {Object.keys(metrics?.rss.sourceMetrics || {}).length || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Active feeds
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Success Rate</h3>
            <div className="text-3xl font-bold text-amber-600">
              {summary?.trends.successRate || 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Publishing success
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Topic Categories</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-center py-20">No data available</div>
            )}
          </div>

          {/* Top Sources */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top RSS Sources (24h)</h3>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-center py-20">No data available</div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* UK Retailer Mentions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">UK Retailer Coverage</h3>
            {retailerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={retailerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="mentions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-500 text-center py-20">No data available</div>
            )}
          </div>

          {/* UK Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">UK-Specific Features</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-700">Price Comparisons</span>
                <span className="font-semibold text-blue-600">
                  {metrics?.uk.priceComparisons || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-700">Brexit Warnings</span>
                <span className="font-semibold text-amber-600">
                  {metrics?.uk.brexitWarnings || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-700">UK-Focused Articles</span>
                <span className="font-semibold text-green-600">
                  {metrics?.uk.ukFocusedArticles || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Est. Claude API Cost (24h)</span>
                <span className="font-semibold text-purple-600">
                  £{((metrics?.generation.costEstimate || 0) * 0.79).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {summary?.alerts && summary.alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
            <div className="space-y-2">
              {summary.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex items-start p-3 rounded-lg ${
                    alert.level === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}
                >
                  <span className="mr-2">{getStatusIcon(alert.level)}</span>
                  <span className={alert.level === 'critical' ? 'text-red-700' : 'text-yellow-700'}>
                    {alert.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>ARIA is protecting {metrics?.publishing.articlesPublished || 0} UK tech buyers today</p>
          <p className="mt-1">"Stop wasting money on tech that disappoints"</p>
        </div>
      </div>
    </div>
  );
}