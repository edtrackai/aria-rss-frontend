import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/cms/ui/card';
import { Badge } from '@/components/cms/ui/badge';
import { Separator } from '@/components/cms/ui/separator';
import { ScrollArea } from '@/components/cms/ui/scroll-area';
import { Skeleton } from '@/components/cms/ui/skeleton';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AIStreamDisplayProps {
  content: string;
  title?: string;
  isStreaming: boolean;
  progress: number;
  metadata?: {
    wordCount: number;
    readingTime: number;
    excerpt?: string;
  };
}

export default function AIStreamDisplay({
  content,
  title,
  isStreaming,
  progress,
  metadata,
}: AIStreamDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    // Auto-scroll to bottom when content updates
    if (scrollRef.current && isStreaming) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  useEffect(() => {
    // Blinking cursor effect
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-semibold mt-5 mb-3">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Generated Article</h3>
          <div className="flex items-center gap-2">
            {isStreaming && (
              <Badge variant="secondary" className="animate-pulse">
                Generating... {progress}%
              </Badge>
            )}
            {metadata && (
              <>
                <Badge variant="outline">{metadata.wordCount} words</Badge>
                <Badge variant="outline">{metadata.readingTime} min read</Badge>
              </>
            )}
          </div>
        </div>
        
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mt-2"
          >
            {title}
          </motion.h1>
        )}
      </div>

      {/* Content Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {content ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown components={components}>
              {content}
            </ReactMarkdown>
            
            {isStreaming && (
              <motion.span
                className={cn(
                  'inline-block w-1 h-5 bg-primary ml-0.5',
                  !showCursor && 'opacity-0'
                )}
                animate={{ opacity: showCursor ? 1 : 0 }}
                transition={{ duration: 0.1 }}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {metadata?.excerpt && (
        <>
          <Separator />
          <div className="p-4">
            <h4 className="text-sm font-medium mb-2">Excerpt</h4>
            <p className="text-sm text-muted-foreground italic">
              "{metadata.excerpt}"
            </p>
          </div>
        </>
      )}
    </Card>
  );
}