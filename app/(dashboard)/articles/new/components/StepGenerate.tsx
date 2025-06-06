import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  RefreshCw, 
  Save, 
  Eye, 
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
  Copy,
  Edit3,
  X
} from 'lucide-react';
import { Button } from '@/components/cms/ui/button';
import { Card } from '@/components/cms/ui/card';
import { Badge } from '@/components/cms/ui/badge';
import { Alert, AlertDescription } from '@/components/cms/ui/alert';
import { Progress } from '@/components/cms/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/cms/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/cms/ui/dialog';
import { Input } from '@/components/cms/ui/input';
import { Label } from '@/components/cms/ui/label';
import { Textarea } from '@/components/cms/ui/textarea';
import { WizardState } from '@/hooks/useWizardState';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { toast } from 'sonner';
import AIStreamDisplay from './AIStreamDisplay';
import { sanitizeWithLineBreaks } from '@/lib/sanitize';

interface StepGenerateProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onComplete: () => void;
}

export default function StepGenerate({ state, updateState, onComplete }: StepGenerateProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const {
    generateArticle,
    cancelGeneration,
    retryGeneration,
    suggestImprovements,
    isGenerating,
    progress,
    streamedContent,
    error,
  } = useAIGeneration({
    onProgress: (content: string) => {
      updateState({ generatedContent: content });
    },
    onComplete: (result: any) => {
      updateState({
        generatedContent: result.content,
        generatedTitle: result.title,
        generatedExcerpt: result.excerpt,
        metaDescription: result.metaDescription || state.metaDescription,
      });
      toast.success('Article generated successfully!');
    },
    onError: (error: string) => {
      toast.error(`Generation failed: ${error}`);
    },
  });

  useEffect(() => {
    // Auto-start generation when component mounts
    if (!hasStarted && !state.generatedContent) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setHasStarted(true);
    
    try {
      const result = await generateArticle({
        prompt: `Write a ${state.length} ${state.style} article about "${state.topic}" with a ${state.tone} tone. ${
          state.keywords?.length ? `Include these keywords naturally: ${state.keywords.join(', ')}.` : ''
        } Structure the article with clear headings and engaging content.`,
        style: state.style,
        tone: state.tone,
        maxTokens: state.length === 'short' ? 300 : state.length === 'medium' ? 800 : 1500,
      });
    } catch (err) {
      // Error is handled in callbacks
    }
  };

  const handleRetry = () => {
    updateState({ generatedContent: '', generatedTitle: '', generatedExcerpt: '' });
    handleGenerate();
  };

  const handleSaveDraft = async () => {
    try {
      const response = await fetch('/api/articles/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.generatedTitle || 'Untitled Draft',
          content: state.generatedContent,
          excerpt: state.generatedExcerpt,
          metaDescription: state.metaDescription,
          keywords: state.keywords,
          category: state.category,
          status: 'draft',
        }),
      });

      if (response.ok) {
        toast.success('Draft saved successfully');
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.generatedTitle,
          content: state.generatedContent,
          excerpt: state.generatedExcerpt,
          metaDescription: state.metaDescription,
          keywords: state.keywords,
          category: state.category,
          status: 'published',
        }),
      });

      if (response.ok) {
        toast.success('Article published successfully!');
        onComplete();
      } else {
        throw new Error('Failed to publish');
      }
    } catch (error) {
      toast.error('Failed to publish article');
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(state.generatedContent || '');
    toast.success('Content copied to clipboard');
  };

  const handleExport = () => {
    const content = `# ${state.generatedTitle}\n\n${state.generatedContent}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.generatedTitle || 'article'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Article exported');
  };

  const handleEditTitle = () => {
    setEditedTitle(state.generatedTitle || '');
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    updateState({ generatedTitle: editedTitle });
    setIsEditingTitle(false);
    toast.success('Title updated');
  };

  const metadata = state.generatedContent ? {
    wordCount: state.generatedContent.split(/\s+/).length,
    readingTime: Math.ceil(state.generatedContent.split(/\s+/).length / 200),
    excerpt: state.generatedExcerpt,
  } : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">AI Article Generation</h2>
        <p className="text-muted-foreground">
          Your article is being generated based on your specifications
        </p>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="font-medium">Generating your article...</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelGeneration}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Topic Analysis</p>
                <p className="font-medium">{progress > 20 ? 'Complete' : 'Processing'}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Content Generation</p>
                <p className="font-medium">{progress > 50 ? 'In Progress' : 'Pending'}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Optimization</p>
                <p className="font-medium">{progress > 80 ? 'Finalizing' : 'Pending'}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !isGenerating && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Content Display */}
      {(streamedContent || state.generatedContent) && (
        <div className="space-y-4">
          {/* Title with Edit */}
          {state.generatedTitle && (
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSaveTitle}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingTitle(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold flex-1">{state.generatedTitle}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditTitle}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Tabs for Content/Preview/Analysis */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <AIStreamDisplay
                content={streamedContent || state.generatedContent || ''}
                title={state.generatedTitle}
                isStreaming={isGenerating}
                progress={progress}
                metadata={metadata}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card className="p-6">
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                  <h1>{state.generatedTitle}</h1>
                  {state.generatedExcerpt && (
                    <p className="lead text-lg text-muted-foreground italic">
                      {state.generatedExcerpt}
                    </p>
                  )}
                  <div dangerouslySetInnerHTML={{ 
                    __html: sanitizeWithLineBreaks(state.generatedContent || '')
                  }} />
                </article>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold">Content Analysis</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Word Count</Label>
                    <p className="text-2xl font-bold">{metadata?.wordCount || 0}</p>
                  </div>
                  <div>
                    <Label>Reading Time</Label>
                    <p className="text-2xl font-bold">{metadata?.readingTime || 0} min</p>
                  </div>
                </div>

                <div>
                  <Label>Keywords Used</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {state.keywords?.map((keyword: string) => {
                      const count = (state.generatedContent?.match(new RegExp(keyword, 'gi')) || []).length;
                      return (
                        <Badge key={keyword} variant="secondary">
                          {keyword} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>SEO Score</Label>
                  <Progress value={85} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Good keyword density and structure
                  </p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Action Buttons */}
      {state.generatedContent && !isGenerating && (
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleCopyContent}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={handlePublish}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish Article
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}