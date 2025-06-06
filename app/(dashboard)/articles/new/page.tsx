'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/cms/ui/card';
import { Button } from '@/components/cms/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWizardState } from '@/hooks/useWizardState';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'sonner';

import StepTopic from './components/StepTopic';
import StepStyle from './components/StepStyle';
import StepSEO from './components/StepSEO';
import StepGenerate from './components/StepGenerate';
import ProgressIndicator from './components/ProgressIndicator';

const STEPS = [
  { id: 'topic', title: 'Choose Topic', component: StepTopic },
  { id: 'style', title: 'Style & Format', component: StepStyle },
  { id: 'seo', title: 'SEO & Keywords', component: StepSEO },
  { id: 'generate', title: 'Generate Article', component: StepGenerate },
] as const;

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </Card>
  );
}

export default function NewArticlePage() {
  const router = useRouter();
  const { state, updateState, resetState, saveToLocalStorage, loadFromLocalStorage } = useWizardState();
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Load saved state on mount
    const savedState = loadFromLocalStorage();
    if (savedState && savedState.lastStep !== undefined) {
      setCurrentStep(savedState.lastStep);
    }
  }, [loadFromLocalStorage]);

  useEffect(() => {
    // Save current step to state
    updateState({ lastStep: currentStep });
  }, [currentStep, updateState]);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setIsNavigating(true);
      await saveToLocalStorage();
      setCurrentStep(prev => prev + 1);
      setIsNavigating(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    resetState();
    toast.success('Article created successfully!');
    router.push('/articles');
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Create New Article</h1>
          <p className="text-muted-foreground mt-1">
            Use AI to generate high-quality articles in minutes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            saveToLocalStorage();
            router.push('/articles');
          }}
        >
          Save & Exit
        </Button>
      </div>

      <ProgressIndicator currentStep={currentStep} steps={STEPS} />

      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setCurrentStep(0)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Card className="p-6">
              <CurrentStepComponent
                state={state}
                updateState={updateState}
                onNext={handleNext}
                onComplete={handleComplete}
              />
            </Card>
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isNavigating}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < STEPS.length - 1 && (
          <Button
            onClick={handleNext}
            disabled={isNavigating}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}