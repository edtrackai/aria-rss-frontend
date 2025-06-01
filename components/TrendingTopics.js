export default function TrendingTopics({ topics }) {
  if (!topics || topics.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600 text-sm">Loading trending topics...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {topics.map((topic, index) => (
        <div 
          key={topic.id} 
          className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {topic.name}
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-aria-accent">
                    {(topic.total_score * 100).toFixed(0)}% hot
                  </span>
                  <span>•</span>
                  <span>{topic.mention_count} mentions</span>
                </div>
                {topic.is_breaking && (
                  <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                    Breaking
                  </span>
                )}
                {topic.uk_relevance_score > 0.7 && (
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    UK Focus
                  </span>
                )}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-300">
              #{index + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}