import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Hash, 
  Target, 
  Info, 
  Plus, 
  X, 
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WizardState } from '@/hooks/useWizardState';
import { aiApi } from '@/lib/api/aiApi';
import { trendsApi } from '@/lib/api/trendsApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StepSEOProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

interface SEOScore {
  overall: number;
  factors: {
    focusKeyword: boolean;
    metaLength: boolean;
    keywordDensity: boolean;
    keywordVariety: boolean;
  };
}

export default function StepSEO({ state, updateState, onNext }: StepSEOProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [trendingKeywords, setTrendingKeywords] = useState<any[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [seoScore, setSeoScore] = useState<SEOScore>({
    overall: 0,
    factors: {
      focusKeyword: false,
      metaLength: false,
      keywordDensity: false,
      keywordVariety: false,
    },
  });

  useEffect(() => {
    // Load suggested keywords based on topic
    loadSuggestedKeywords();
    loadTrendingKeywords();
  }, [state.topic]);

  useEffect(() => {
    // Calculate SEO score
    calculateSEOScore();
  }, [state.focusKeyword, state.metaDescription, state.keywords]);

  const loadSuggestedKeywords = async () => {
    if (!state.topic) return;

    setIsLoadingKeywords(true);
    try {
      const response = await aiApi.suggestKeywords(state.topic, 15);
      const keywords = response.keywords?.map(k => k.keyword) || [];
      setSuggestedKeywords(keywords);
    } catch (error) {
      console.error('Failed to load keyword suggestions:', error);
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  const loadTrendingKeywords = async () => {
    try {
      const response = await trendsApi.getTrendingKeywords({ category: state.category });
      const trending = response.trends?.map(trend => ({
        keyword: trend.keyword,
        volume: trend.volume,
        trend: 'stable' as const // Default trend since TrendData doesn't have trending property
      })) || [];
      setTrendingKeywords(trending);
    } catch (error) {
      console.error('Failed to load trending keywords:', error);
    }
  };

  const calculateSEOScore = () => {
    const factors = {
      focusKeyword: !!state.focusKeyword && state.focusKeyword.length > 2,
      metaLength: (state.metaDescription?.length || 0) >= 120 && (state.metaDescription?.length || 0) <= 160,
      keywordDensity: (state.keywords?.length || 0) >= 3 && (state.keywords?.length || 0) <= 10,
      keywordVariety: (state.keywords?.length || 0) >= 5,
    };

    const score = Object.values(factors).filter(Boolean).length * 25;

    setSeoScore({ overall: score, factors });
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !(state.keywords || []).includes(keywordInput.trim())) {
      updateState({ keywords: [...(state.keywords || []), keywordInput.trim()] });
      setKeywordInput('');
      toast.success('Keyword added');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    updateState({ keywords: (state.keywords || []).filter(k => k !== keyword) });
  };

  const handleSuggestedKeyword = (keyword: string) => {
    if (!(state.keywords || []).includes(keyword)) {
      updateState({ keywords: [...(state.keywords || []), keyword] });
      toast.success('Keyword added');
    }
  };

  const generateMetaDescription = async () => {
    if (!state.topic) return;

    setIsGeneratingMeta(true);
    try {
      const response = await aiApi.generateMetaDescription(state.topic, 160);
      updateState({ metaDescription: response.metaDescription });
      toast.success('Meta description generated');
    } catch (error) {
      toast.error('Failed to generate meta description');
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 75) return CheckCircle2;
    if (score >= 50) return AlertCircle;
    return AlertCircle;
  };

  const ScoreIcon = getScoreIcon(seoScore.overall);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">SEO Optimization</h2>
        <p className="text-muted-foreground">
          Optimize your article for search engines with keywords and metadata
        </p>
      </div>

      {/* SEO Score Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">SEO Score</h3>
          <div className="flex items-center gap-2">
            <ScoreIcon className={cn('w-5 h-5', getScoreColor(seoScore.overall))} />
            <span className={cn('text-2xl font-bold', getScoreColor(seoScore.overall))}>
              {seoScore.overall}%
            </span>
          </div>
        </div>
        <Progress value={seoScore.overall} className="mb-4" />
        <div className="space-y-2">
          {Object.entries(seoScore.factors).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {key === 'focusKeyword' && 'Focus keyword set'}
                {key === 'metaLength' && 'Meta description length (120-160 chars)'}
                {key === 'keywordDensity' && 'Keyword count (3-10 keywords)'}
                {key === 'keywordVariety' && 'Keyword variety (5+ keywords)'}
              </span>
              <span className={value ? 'text-green-600' : 'text-muted-foreground'}>
                {value ? '✓' : '○'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        {/* Focus Keyword */}
        <div className="space-y-2">
          <Label htmlFor="focus-keyword" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Focus Keyword
            <Popover>
              <PopoverTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <p className="text-sm">
                  The main keyword you want to rank for. This should appear in your title, 
                  meta description, and throughout your content.
                </p>
              </PopoverContent>
            </Popover>
          </Label>
          <Input
            id="focus-keyword"
            value={state.focusKeyword}
            onChange={(e) => updateState({ focusKeyword: e.target.value })}
            placeholder="Enter your main target keyword"
          />
        </div>

        <Separator />

        {/* Keywords */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Keywords & Tags
          </Label>
          
          <div className="flex gap-2">
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Add a keyword"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
            />
            <Button onClick={handleAddKeyword} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Keywords */}
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            <AnimatePresence>
              {(state.keywords || []).map((keyword) => (
                <motion.div
                  key={keyword}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {keyword}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveKeyword(keyword)}
                    />
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Suggested Keywords */}
          {isLoadingKeywords ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            suggestedKeywords.length > 0 && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Suggested Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords
                    .filter(k => !(state.keywords || []).includes(k))
                    .slice(0, 8)
                    .map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleSuggestedKeyword(keyword)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                </div>
              </Card>
            )
          )}

          {/* Trending Keywords */}
          {trendingKeywords.length > 0 && (
            <Card className="p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending in {state.category || 'this category'}
              </h4>
              <div className="space-y-2">
                {trendingKeywords.slice(0, 5).map((item) => (
                  <div
                    key={item.keyword}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className="cursor-pointer hover:text-primary"
                      onClick={() => handleSuggestedKeyword(item.keyword)}
                    >
                      {item.keyword}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.volume} searches
                      </Badge>
                      <span className={cn(
                        'text-xs',
                        item.trend === 'up' && 'text-green-600',
                        item.trend === 'down' && 'text-red-600',
                        item.trend === 'stable' && 'text-muted-foreground'
                      )}>
                        {item.trend === 'up' && '↑'}
                        {item.trend === 'down' && '↓'}
                        {item.trend === 'stable' && '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Separator />

        {/* Meta Description */}
        <div className="space-y-2">
          <Label htmlFor="meta-description" className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Meta Description
            </span>
            <span className="text-xs text-muted-foreground">
              {(state.metaDescription?.length || 0)}/160 characters
            </span>
          </Label>
          <Textarea
            id="meta-description"
            value={state.metaDescription || ''}
            onChange={(e) => updateState({ metaDescription: e.target.value })}
            placeholder="Write a compelling meta description for search results..."
            className="min-h-[80px]"
            maxLength={160}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Appears in search results. Include your focus keyword naturally.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateMetaDescription}
              disabled={isGeneratingMeta || !state.topic}
            >
              {isGeneratingMeta ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate with AI'
              )}
            </Button>
          </div>
        </div>

        {/* SEO Tips */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>SEO Tips:</strong> Use your focus keyword in the title, first paragraph, 
            and naturally throughout the content. Aim for 1-2% keyword density.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext} 
          size="lg"
          disabled={!state.focusKeyword || (state.keywords?.length || 0) === 0}
        >
          Generate Article
        </Button>
      </div>
    </div>
  );
}