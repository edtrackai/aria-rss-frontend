"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  topic?: string;
  tone?: 'formal' | 'informal' | 'friendly' | 'authoritative';
  style?: 'professional' | 'casual' | 'technical' | 'creative';
  length?: 'short' | 'medium' | 'long';
  keywords?: string[];
  title?: string;
  structure: {
    sections: Array<{
      type: string;
      title?: string;
      required?: boolean;
    }>;
  };
}

export interface WizardStep {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  isRequired: boolean
  data?: any
}

export interface WizardState {
  currentStepIndex: number
  steps: WizardStep[]
  isCompleted: boolean
  canGoBack: boolean
  canGoNext: boolean
  formData: Record<string, any>
  // Article generation state
  topic?: string
  tone?: 'formal' | 'informal' | 'friendly' | 'authoritative'
  style?: 'professional' | 'casual' | 'technical' | 'creative'
  length?: 'short' | 'medium' | 'long'
  keywords?: string[]
  targetAudience?: string
  focusKeyword?: string
  metaDescription?: string
  category?: string
  template?: ArticleTemplate
  // Generated content
  generatedTitle?: string
  generatedContent?: string
  generatedExcerpt?: string
}

interface WizardActions {
  initializeSteps: (steps: Omit<WizardStep, 'isCompleted'>[]) => void
  goToStep: (stepIndex: number) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  completeStep: (stepId: string, data?: any) => void
  updateStepData: (stepId: string, data: any) => void
  updateFormData: (data: Record<string, any>) => void
  updateState: (data: Partial<WizardState>) => void
  resetState: () => void
  resetWizard: () => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  setStepValidation: (stepId: string, isValid: boolean) => void
}

type WizardStore = WizardState & WizardActions

const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStepIndex: 0,
      steps: [],
      isCompleted: false,
      canGoBack: false,
      canGoNext: false,
      formData: {},
      // Article generation state
      topic: undefined,
      tone: undefined,
      style: undefined,
      length: undefined,
      keywords: [],
      targetAudience: undefined,
      focusKeyword: undefined,
      metaDescription: undefined,
      category: undefined,
      // Generated content
      generatedTitle: undefined,
      generatedContent: undefined,
      generatedExcerpt: undefined,

      // Actions
      initializeSteps: (stepConfigs) => {
        const steps: WizardStep[] = stepConfigs.map(config => ({
          ...config,
          isCompleted: false,
        }))

        set({
          steps,
          currentStepIndex: 0,
          isCompleted: false,
          canGoBack: false,
          canGoNext: !steps[0]?.isRequired || false,
          formData: {},
        })
      },

      goToStep: (stepIndex) => {
        const { steps } = get()
        
        if (stepIndex < 0 || stepIndex >= steps.length) {
          return
        }

        // Check if we can navigate to this step
        const requiredPreviousSteps = steps.slice(0, stepIndex)
        const allRequiredCompleted = requiredPreviousSteps
          .filter(step => step.isRequired)
          .every(step => step.isCompleted)

        if (!allRequiredCompleted && stepIndex > get().currentStepIndex) {
          return
        }

        const canGoBack = stepIndex > 0
        const canGoNext = stepIndex < steps.length - 1 && 
          (!steps[stepIndex + 1]?.isRequired || steps[stepIndex].isCompleted)

        set({
          currentStepIndex: stepIndex,
          canGoBack,
          canGoNext,
        })
      },

      goToNextStep: () => {
        const { currentStepIndex, steps } = get()
        const nextIndex = currentStepIndex + 1
        
        if (nextIndex < steps.length) {
          get().goToStep(nextIndex)
        }
      },

      goToPreviousStep: () => {
        const { currentStepIndex } = get()
        const prevIndex = currentStepIndex - 1
        
        if (prevIndex >= 0) {
          get().goToStep(prevIndex)
        }
      },

      completeStep: (stepId, data) => {
        set(state => {
          const stepIndex = state.steps.findIndex(step => step.id === stepId)
          if (stepIndex === -1) return state

          const updatedSteps = [...state.steps]
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            isCompleted: true,
            data: data || updatedSteps[stepIndex].data,
          }

          // Check if all required steps are completed
          const allRequiredCompleted = updatedSteps
            .filter(step => step.isRequired)
            .every(step => step.isCompleted)

          const isCompleted = allRequiredCompleted

          // Update navigation permissions
          const currentStep = updatedSteps[state.currentStepIndex]
          const canGoNext = state.currentStepIndex < updatedSteps.length - 1 && 
            (!currentStep?.isRequired || currentStep.isCompleted)

          return {
            ...state,
            steps: updatedSteps,
            isCompleted,
            canGoNext,
          }
        })
      },

      updateStepData: (stepId, data) => {
        set(state => {
          const stepIndex = state.steps.findIndex(step => step.id === stepId)
          if (stepIndex === -1) return state

          const updatedSteps = [...state.steps]
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            data: {
              ...updatedSteps[stepIndex].data,
              ...data,
            },
          }

          return {
            ...state,
            steps: updatedSteps,
          }
        })
      },

      updateFormData: (data) => {
        set(state => ({
          ...state,
          formData: {
            ...state.formData,
            ...data,
          },
        }))
      },

      updateState: (data) => {
        set(state => ({
          ...state,
          ...data,
        }))
      },

      setStepValidation: (stepId, isValid) => {
        set(state => {
          const stepIndex = state.steps.findIndex(step => step.id === stepId)
          if (stepIndex === -1) return state

          const updatedSteps = [...state.steps]
          if (isValid && !updatedSteps[stepIndex].isCompleted) {
            // Don't automatically complete, just update validation
            // Completion should be explicit via completeStep
          }

          // Update navigation based on current step validation
          const canGoNext = state.currentStepIndex < updatedSteps.length - 1 && 
            (state.currentStepIndex !== stepIndex || isValid)

          return {
            ...state,
            steps: updatedSteps,
            canGoNext,
          }
        })
      },

      resetState: () => {
        set(state => ({
          ...state,
          topic: undefined,
          tone: undefined,
          style: undefined,
          length: undefined,
          keywords: [],
          targetAudience: undefined,
          focusKeyword: undefined,
          metaDescription: undefined,
          category: undefined,
          generatedTitle: undefined,
          generatedContent: undefined,
          generatedExcerpt: undefined,
        }))
      },

      resetWizard: () => {
        set({
          currentStepIndex: 0,
          steps: [],
          isCompleted: false,
          canGoBack: false,
          canGoNext: false,
          formData: {},
          topic: undefined,
          tone: undefined,
          style: undefined,
          length: undefined,
          keywords: [],
          targetAudience: undefined,
          focusKeyword: undefined,
          metaDescription: undefined,
          category: undefined,
          generatedTitle: undefined,
          generatedContent: undefined,
          generatedExcerpt: undefined,
        })
      },

      saveToLocalStorage: () => {
        // This is handled automatically by the persist middleware
      },

      loadFromLocalStorage: () => {
        // This is handled automatically by the persist middleware
      },
    }),
    {
      name: 'wizard-state',
      partialize: (state) => ({
        currentStepIndex: state.currentStepIndex,
        steps: state.steps,
        formData: state.formData,
        isCompleted: state.isCompleted,
      }),
    }
  )
)

/**
 * Main wizard hook
 */
export function useWizardState() {
  const store = useWizardStore()

  return {
    ...store,
    currentStep: store.steps[store.currentStepIndex],
    totalSteps: store.steps.length,
    progress: store.steps.length > 0 ? 
      ((store.currentStepIndex + 1) / store.steps.length) * 100 : 0,
    completedSteps: store.steps.filter(step => step.isCompleted).length,
  }
}

/**
 * Hook for managing a specific step
 */
export function useWizardStep(stepId: string) {
  const {
    steps,
    currentStep,
    completeStep,
    updateStepData,
    setStepValidation,
    goToNextStep,
    goToPreviousStep,
  } = useWizardState()

  const step = steps.find(s => s.id === stepId)
  const isCurrentStep = currentStep?.id === stepId
  const stepIndex = steps.findIndex(s => s.id === stepId)

  return {
    step,
    isCurrentStep,
    stepIndex,
    isCompleted: step?.isCompleted || false,
    data: step?.data,
    complete: (data?: any) => completeStep(stepId, data),
    updateData: (data: any) => updateStepData(stepId, data),
    setValid: (isValid: boolean) => setStepValidation(stepId, isValid),
    goNext: goToNextStep,
    goPrevious: goToPreviousStep,
  }
}

/**
 * Hook for form validation within a wizard step
 */
export function useWizardValidation(stepId: string, validator: () => boolean) {
  const { setValid } = useWizardStep(stepId)

  const validate = () => {
    const isValid = validator()
    setValid(isValid)
    return isValid
  }

  return {
    validate,
    setValid,
  }
}

export default useWizardState