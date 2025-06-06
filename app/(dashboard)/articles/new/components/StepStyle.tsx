import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Users, 
  FileText, 
  Clock, 
  Sparkles,
  Briefcase,
  Heart,
  Zap,
  BookOpen,
  Smile
} from 'lucide-react';
import { Button } from '@/components/cms/ui/button';
import { Card } from '@/components/cms/ui/card';
import { Label } from '@/components/cms/ui/label';
import { Slider } from '@/components/cms/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/cms/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/cms/ui/select';
import { Badge } from '@/components/cms/ui/badge';
import { Separator } from '@/components/cms/ui/separator';
import { WizardState } from '@/hooks/useWizardState';
import { cn } from '@/lib/utils';

interface StepStyleProps {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

const TONES = [
  { value: 'formal' as const, label: 'Professional', icon: Briefcase, description: 'Formal and authoritative' },
  { value: 'friendly' as const, label: 'Conversational', icon: Smile, description: 'Friendly and approachable' },
  { value: 'informal' as const, label: 'Instructional', icon: BookOpen, description: 'Clear and educational' },
  { value: 'authoritative' as const, label: 'Inspirational', icon: Heart, description: 'Motivating and uplifting' },
];

const STYLES = [
  { value: 'professional' as const, label: 'Informative Article', description: 'Fact-based content with research' },
  { value: 'technical' as const, label: 'How-To Guide', description: 'Step-by-step instructions' },
  { value: 'casual' as const, label: 'Listicle', description: 'Numbered or bulleted list format' },
  { value: 'creative' as const, label: 'Opinion Piece', description: 'Personal perspective and analysis' },
];

const TARGET_AUDIENCES = [
  { value: 'general', label: 'General Audience', description: 'Wide appeal, accessible language' },
  { value: 'professionals', label: 'Industry Professionals', description: 'Technical, industry-specific' },
  { value: 'beginners', label: 'Beginners', description: 'Simple explanations, basics' },
  { value: 'experts', label: 'Subject Experts', description: 'Advanced, detailed content' },
  { value: 'students', label: 'Students', description: 'Educational, learning-focused' },
  { value: 'business', label: 'Business Decision Makers', description: 'ROI-focused, strategic' },
];

const LENGTH_PRESETS = [
  { value: 'short' as const, wordCount: 500, label: 'Short', description: 'Quick read (2-3 min)' },
  { value: 'medium' as const, wordCount: 1000, label: 'Medium', description: 'Standard article (4-5 min)' },
  { value: 'long' as const, wordCount: 1500, label: 'Long', description: 'In-depth piece (6-8 min)' },
];

// Helper functions for length conversion
const lengthToWordCount = (length: 'short' | 'medium' | 'long' | undefined): number => {
  switch (length) {
    case 'short': return 500;
    case 'medium': return 1000;
    case 'long': return 1500;
    default: return 1000;
  }
};

const wordCountToLength = (wordCount: number): 'short' | 'medium' | 'long' => {
  if (wordCount <= 750) return 'short';
  if (wordCount <= 1250) return 'medium';
  return 'long';
};

export default function StepStyle({ state, updateState, onNext }: StepStyleProps) {
  const [previewText, setPreviewText] = useState('');
  const [currentWordCount, setCurrentWordCount] = useState(lengthToWordCount(state.length));

  const handleLengthChange = (value: number[]) => {
    const wordCount = value[0];
    const lengthEnum = wordCountToLength(wordCount);
    setCurrentWordCount(wordCount);
    updateState({ length: lengthEnum });
  };

  const getReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const generatePreview = () => {
    const toneDescriptions: Record<string, string> = {
      formal: "This comprehensive analysis examines the key factors...",
      friendly: "Hey there! Let's dive into this fascinating topic...",
      informal: "In this guide, you'll learn exactly how to...",
      authoritative: "Research definitively shows that implementing these strategies...",
    };

    setPreviewText(state.tone ? toneDescriptions[state.tone] : "Your article will begin here...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Define your article style</h2>
        <p className="text-muted-foreground">
          Customize the tone, format, and length to match your audience
        </p>
      </div>

      <div className="space-y-6">
        {/* Tone Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Writing Tone
          </Label>
          <RadioGroup
            value={state.tone}
            onValueChange={(value) => updateState({ tone: value as 'formal' | 'informal' | 'friendly' | 'authoritative' })}
            className="grid grid-cols-2 gap-3"
          >
            {TONES.map((tone) => {
              const Icon = tone.icon;
              return (
                <motion.div
                  key={tone.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Label
                    htmlFor={tone.value}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      state.tone === tone.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <RadioGroupItem value={tone.value} id={tone.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <Icon className="w-4 h-4" />
                        {tone.label}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tone.description}
                      </p>
                    </div>
                  </Label>
                </motion.div>
              );
            })}
          </RadioGroup>
        </div>

        <Separator />

        {/* Style Selection */}
        <div className="space-y-3">
          <Label htmlFor="style" className="text-base font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Article Format
          </Label>
          <Select value={state.style} onValueChange={(value) => updateState({ style: value as 'professional' | 'casual' | 'technical' | 'creative' })}>
            <SelectTrigger id="style">
              <SelectValue placeholder="Select article format" />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  <div>
                    <div className="font-medium">{style.label}</div>
                    <div className="text-xs text-muted-foreground">{style.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Target Audience */}
        <div className="space-y-3">
          <Label htmlFor="audience" className="text-base font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Target Audience
          </Label>
          <Select 
            value={state.targetAudience} 
            onValueChange={(value) => updateState({ targetAudience: value })}
          >
            <SelectTrigger id="audience">
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent>
              {TARGET_AUDIENCES.map((audience) => (
                <SelectItem key={audience.value} value={audience.value}>
                  <div>
                    <div className="font-medium">{audience.label}</div>
                    <div className="text-xs text-muted-foreground">{audience.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Length Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Article Length
          </Label>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {LENGTH_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={state.length === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  updateState({ length: preset.value });
                  setCurrentWordCount(preset.wordCount);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Slider
              value={[currentWordCount]}
              onValueChange={handleLengthChange}
              min={300}
              max={3000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>300 words</span>
              <span className="font-medium text-foreground">
                {currentWordCount} words (~{getReadingTime(currentWordCount)} min read)
              </span>
              <span>3000 words</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Style Preview */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Style Preview
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={generatePreview}
            >
              Generate Preview
            </Button>
          </div>
          
          {previewText ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm italic text-muted-foreground"
            >
              "{previewText}"
            </motion.p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click "Generate Preview" to see how your article will start
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <Badge variant="secondary">
              {TONES.find(t => t.value === state.tone)?.label}
            </Badge>
            <Badge variant="secondary">
              {STYLES.find(s => s.value === state.style)?.label}
            </Badge>
            <Badge variant="secondary">
              {currentWordCount} words
            </Badge>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} size="lg">
          Continue to SEO Settings
        </Button>
      </div>
    </div>
  );
}