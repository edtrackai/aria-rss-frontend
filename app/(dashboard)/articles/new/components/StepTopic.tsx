import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, BookOpen, Hash } from 'lucide-react';
import { Input } from '@/components/cms/ui/input';
import { Button } from '@/components/cms/ui/button';
import { Label } from '@/components/cms/ui/label';
import { Alert, AlertDescription } from '@/components/cms/ui/alert';
import { Textarea } from '@/components/cms/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/cms/ui/select';
import { Card } from '@/components/cms/ui/card';
import { Badge } from '@/components/cms/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/cms/ui/tabs';
import { useTrendingTopics, TrendingTopic } from '@/hooks/useTrendingTopics';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { WizardState, ArticleTemplate } from '@/hooks/useWizardState';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import TrendingSuggestions from './TrendingSuggestions';

interface StepTopicProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

const CATEGORIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'health', label: 'Health & Wellness', icon: '🏥' },
  { value: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'food', label: 'Food & Cooking', icon: '🍳' },
  { value: 'finance', label: 'Finance', icon: '💰' },
];

const QUICK_TEMPLATES: ArticleTemplate[] = [
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step instructional content',
    topic: 'How to [achieve specific goal]',
    tone: 'friendly',
    style: 'technical',
    length: 'long',
    keywords: ['how to', 'guide', 'tutorial', 'steps'],
    structure: {
      sections: [
        { type: 'introduction', required: true },
        { type: 'steps', title: 'Step-by-step guide', required: true },
        { type: 'conclusion', required: true }
      ]
    }
  },
  {
    id: 'listicle',
    name: 'Listicle',
    description: 'Numbered list format article',
    topic: '[Number] Best [Items/Tips] for [Purpose]',
    tone: 'informal',
    style: 'casual',
    length: 'medium',
    keywords: ['best', 'top', 'list'],
    structure: {
      sections: [
        { type: 'introduction', required: true },
        { type: 'list', title: 'Main list items', required: true },
        { type: 'conclusion', required: true }
      ]
    }
  },
  {
    id: 'review',
    name: 'Product Review',
    description: 'In-depth product analysis',
    topic: '[Product Name] Review: [Year]',
    tone: 'formal',
    style: 'professional',
    length: 'long',
    keywords: ['review', 'pros and cons', 'features'],
    structure: {
      sections: [
        { type: 'introduction', required: true },
        { type: 'features', title: 'Key features', required: true },
        { type: 'pros-cons', title: 'Pros and cons', required: true },
        { type: 'conclusion', required: true }
      ]
    }
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Compare multiple options',
    topic: '[Option A] vs [Option B]: Which is Better?',
    tone: 'authoritative',
    style: 'professional',
    length: 'long',
    keywords: ['vs', 'comparison', 'difference'],
    structure: {
      sections: [
        { type: 'introduction', required: true },
        { type: 'comparison', title: 'Detailed comparison', required: true },
        { type: 'verdict', title: 'Final verdict', required: true }
      ]
    }
  },
];

export default function StepTopic({ state, updateState, onNext }: StepTopicProps) {
  const [topicInput, setTopicInput] = useState(state.topic || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('manual');

  const { validateTopic } = useAIGeneration();
  const {
    topics,
    isLoading: topicsLoading,
    selectedTopic,
    setSelectedTopic,
    searchTopics,
    refetch: refetchTrends,
  } = useTrendingTopics({ category: state.category, limit: 5 });

  // Debounced topic validation
  const debouncedValidate = useCallback(
    debounce(async (topic: string) => {
      if (topic.length < 3) return;

      setIsValidating(true);
      try {
        const result = await validateTopic(topic);
        setValidationResult(result);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (topicInput) {
      debouncedValidate(topicInput);
    }
  }, [topicInput, debouncedValidate]);

  const handleTopicChange = (value: string) => {
    setTopicInput(value);
    updateState({ topic: value });
  };

  const handleCategoryChange = (category: string) => {
    updateState({ category });
  };

  const handleTemplateSelect = (template: ArticleTemplate) => {
    updateState({
      template,
      topic: template.topic,
      tone: template.tone,
      style: template.style,
      length: template.length,
      keywords: template.keywords,
    });
    setTopicInput(template.topic || '');
    toast.success(`Template "${template.name}" applied`);
  };

  const handleTrendingTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic.keyword);
    setTopicInput(topic.title || topic.keyword);
    updateState({
      topic: topic.title || topic.keyword,
      category: topic.category,
      keywords: topic.suggestedKeywords,
    });
    toast.success('Trending topic selected');
  };

  const handleNext = () => {
    if (!state.topic || state.topic.length < 3) {
      toast.error('Please enter a valid topic');
      return;
    }
    onNext();
  };

  const isValid = state.topic && state.topic.length >= 3 && !isValidating;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">What would you like to write about?</h2>
        <p className="text-muted-foreground">
          Choose a topic manually, select from trending topics, or use a quick template
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={state.category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <div className="relative">
              <Textarea
                id="topic"
                value={topicInput}
                onChange={(e) => handleTopicChange(e.target.value)}
                placeholder="Enter your article topic or idea..."
                className="min-h-[80px] pr-10"
              />
              {isValidating && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Be specific - the more detail you provide, the better the article will be
            </p>
          </div>

          {validationResult && !isValidating && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {!validationResult.isValid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This topic might be too broad or unclear. Consider being more specific.
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.suggestions.length > 0 && (
                <Card className="p-4">
                  <h4 className="text-sm font-medium mb-2">Suggested improvements:</h4>
                  <div className="space-y-2">
                    {validationResult.suggestions.map((suggestion: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => handleTopicChange(suggestion)}
                      >
                        <Search className="w-3.5 h-3.5 mr-2" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {validationResult.keywords.length > 0 && (
                <Card className="p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Detected keywords:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {validationResult.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="mt-4">
          <TrendingSuggestions
            topics={topics}
            isLoading={topicsLoading}
            onSelectTopic={handleTrendingTopicSelect}
            selectedCategory={state.category}
            onRefresh={refetchTrends}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-3">
            {QUICK_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {template.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Example: {template.topic}
                    </p>
                  </div>
                  <Badge variant="secondary">{template.length} words</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} disabled={!isValid} size="lg">
          Continue to Style & Format
        </Button>
      </div>
    </div>
  );
}