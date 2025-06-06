import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, Sparkles, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingTopic } from '@/hooks/useTrendingTopics';
import { cn } from '@/lib/utils';

interface TrendingSuggestionsProps {
  topics: TrendingTopic[];
  isLoading: boolean;
  onSelectTopic: (topic: TrendingTopic) => void;
  selectedCategory?: string;
  onRefresh: () => void;
}

export default function TrendingSuggestions({
  topics,
  isLoading,
  onSelectTopic,
  selectedCategory,
  onRefresh,
}: TrendingSuggestionsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending Topics
          </h3>
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Trending Topics
          {selectedCategory && (
            <Badge variant="secondary" className="text-xs">
              {selectedCategory}
            </Badge>
          )}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-8 px-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {topics.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No trending topics found</p>
          </motion.div>
        ) : (
          topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              onHoverStart={() => setHoveredId(topic.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <Card
                className={cn(
                  'p-4 cursor-pointer transition-all duration-200',
                  'hover:shadow-md hover:border-primary/50',
                  hoveredId === topic.id && 'scale-[1.02]'
                )}
                onClick={() => onSelectTopic(topic)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate flex items-center gap-2">
                      {topic.title}
                      {topic.trendScore > 80 && (
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                      )}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground">
                        {formatNumber(topic.searchVolume)} searches
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs px-2 py-0', getCompetitionColor(topic.competition))}
                      >
                        {topic.competition} competition
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-2xl font-bold text-primary">
                      {topic.trendScore}
                    </div>
                    <span className="text-xs text-muted-foreground">score</span>
                  </div>
                </div>

                {hoveredId === topic.id && topic.suggestedKeywords.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 pt-3 border-t"
                  >
                    <p className="text-xs text-muted-foreground mb-2">Suggested keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {topic.suggestedKeywords.slice(0, 5).map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-2 py-0">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}