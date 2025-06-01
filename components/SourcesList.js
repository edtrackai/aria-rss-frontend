import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SourcesList() {
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/feeds/status`,
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  );
  
  if (error) {
    return (
      <div className="text-sm text-red-600">
        Failed to load sources
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  const sources = data.sources || [];
  const summary = data.summary || {};
  
  // Group by region
  const ukSources = sources.filter(s => s.region === 'UK' && s.is_active);
  const globalSources = sources.filter(s => s.region !== 'UK' && s.is_active);
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-sm text-gray-600">
        <div className="flex justify-between mb-1">
          <span>Active Sources:</span>
          <span className="font-semibold">{summary.active || 0}/{summary.total || 0}</span>
        </div>
        {summary.failing > 0 && (
          <div className="text-red-600">
            ⚠️ {summary.failing} sources having issues
          </div>
        )}
      </div>
      
      {/* UK Sources */}
      {ukSources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">🇬🇧 UK Sources</h4>
          <div className="space-y-1">
            {ukSources.map(source => (
              <div key={source.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{source.name}</span>
                <StatusIndicator status={source.last_fetch_status} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Global Sources */}
      {globalSources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">🌍 Global Sources</h4>
          <div className="space-y-1">
            {globalSources.slice(0, 5).map(source => (
              <div key={source.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{source.name}</span>
                <StatusIndicator status={source.last_fetch_status} />
              </div>
            ))}
            {globalSources.length > 5 && (
              <p className="text-xs text-gray-500">
                + {globalSources.length - 5} more sources
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ status }) {
  if (status === 'success') {
    return <span className="text-green-500">●</span>;
  } else if (status === 'failed') {
    return <span className="text-red-500">●</span>;
  } else {
    return <span className="text-gray-400">●</span>;
  }
}