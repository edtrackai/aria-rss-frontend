import { renderHook, act } from '@testing-library/react'
import { useWizardState, useWizardStep, WizardStep } from '../useWizardState'

describe('useWizardState', () => {
  const mockSteps: Omit<WizardStep, 'isCompleted'>[] = [
    { id: 'step1', title: 'Step 1', isRequired: true },
    { id: 'step2', title: 'Step 2', isRequired: true },
    { id: 'step3', title: 'Step 3', isRequired: false },
    { id: 'step4', title: 'Step 4', isRequired: true },
  ]

  beforeEach(() => {
    // Reset wizard state
    const { result } = renderHook(() => useWizardState())
    act(() => {
      result.current.resetWizard()
    })
  })

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useWizardState())
      
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.steps).toEqual([])
      expect(result.current.isCompleted).toBe(false)
      expect(result.current.canGoBack).toBe(false)
      expect(result.current.canGoNext).toBe(false)
      expect(result.current.formData).toEqual({})
      expect(result.current.totalSteps).toBe(0)
      expect(result.current.progress).toBe(0)
      expect(result.current.completedSteps).toBe(0)
    })
  })

  describe('step initialization', () => {
    it('should initialize wizard steps', () => {
      const { result } = renderHook(() => useWizardState())

      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      expect(result.current.steps).toHaveLength(4)
      expect(result.current.steps[0]).toEqual({
        id: 'step1',
        title: 'Step 1',
        isRequired: true,
        isCompleted: false
      })
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.canGoBack).toBe(false)
      expect(result.current.totalSteps).toBe(4)
    })

    it('should set navigation permissions correctly on initialization', () => {
      const { result } = renderHook(() => useWizardState())

      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      // Can't go next because first step is required and not completed
      expect(result.current.canGoNext).toBe(false)
      expect(result.current.canGoBack).toBe(false)
    })
  })

  describe('navigation', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useWizardState())
      act(() => {
        result.current.initializeSteps(mockSteps)
      })
    })

    it('should navigate to specific step when requirements are met', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
        // Complete required steps first
        result.current.completeStep('step1')
        result.current.completeStep('step2')
      })

      act(() => {
        result.current.goToStep(2)
      })

      expect(result.current.currentStepIndex).toBe(2)
      expect(result.current.currentStep.id).toBe('step3')
    })

    it('should not navigate beyond valid range', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      act(() => {
        result.current.goToStep(-1)
      })
      expect(result.current.currentStepIndex).toBe(0)

      act(() => {
        result.current.goToStep(10)
      })
      expect(result.current.currentStepIndex).toBe(0)
    })

    it('should go to next step', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
        // Complete first step to allow navigation
        result.current.completeStep('step1')
      })

      act(() => {
        result.current.goToNextStep()
      })

      expect(result.current.currentStepIndex).toBe(1)
    })

    it('should go to previous step', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
        // Complete steps to allow navigation
        result.current.completeStep('step1')
        result.current.completeStep('step2')
        result.current.goToStep(2)
      })

      act(() => {
        result.current.goToPreviousStep()
      })

      expect(result.current.currentStepIndex).toBe(1)
    })

    it('should not go to previous step from first step', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      act(() => {
        result.current.goToPreviousStep()
      })

      expect(result.current.currentStepIndex).toBe(0)
    })
  })

  describe('step completion', () => {
    it('should complete a step', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      const testData = { field: 'value' }
      act(() => {
        result.current.completeStep('step1', testData)
      })

      const step1 = result.current.steps.find(s => s.id === 'step1')
      expect(step1?.isCompleted).toBe(true)
      expect(step1?.data).toEqual(testData)
      expect(result.current.completedSteps).toBe(1)
    })

    it('should update navigation permissions after completion', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      expect(result.current.canGoNext).toBe(false)

      act(() => {
        result.current.completeStep('step1')
      })

      expect(result.current.canGoNext).toBe(true)
    })

    it('should mark wizard as completed when all required steps are done', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      expect(result.current.isCompleted).toBe(false)

      act(() => {
        result.current.completeStep('step1')
        result.current.completeStep('step2')
        result.current.completeStep('step4')
      })

      expect(result.current.isCompleted).toBe(true)
    })
  })

  describe('step data management', () => {
    it('should update step data', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      const initialData = { field1: 'value1' }
      const updateData = { field2: 'value2' }

      act(() => {
        result.current.updateStepData('step1', initialData)
      })

      act(() => {
        result.current.updateStepData('step1', updateData)
      })

      const step1 = result.current.steps.find(s => s.id === 'step1')
      expect(step1?.data).toEqual({ ...initialData, ...updateData })
    })

    it('should update form data', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      const formData = { name: 'John', email: 'john@example.com' }
      act(() => {
        result.current.updateFormData(formData)
      })

      expect(result.current.formData).toEqual(formData)

      const additionalData = { age: 30 }
      act(() => {
        result.current.updateFormData(additionalData)
      })

      expect(result.current.formData).toEqual({ ...formData, ...additionalData })
    })
  })

  describe('state management', () => {
    it('should update wizard state', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      const stateUpdate = {
        topic: 'AI Technology',
        tone: 'professional' as const,
        keywords: ['AI', 'technology']
      }

      act(() => {
        result.current.updateState(stateUpdate)
      })

      expect(result.current.topic).toBe('AI Technology')
      expect(result.current.tone).toBe('professional')
      expect(result.current.keywords).toEqual(['AI', 'technology'])
    })

    it('should reset article state but keep wizard structure', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
        result.current.updateState({
          topic: 'Test Topic',
          tone: 'formal',
          generatedContent: 'Some content'
        })
      })

      expect(result.current.topic).toBe('Test Topic')

      act(() => {
        result.current.resetState()
      })

      expect(result.current.topic).toBeUndefined()
      expect(result.current.tone).toBeUndefined()
      expect(result.current.generatedContent).toBeUndefined()
      // Wizard structure should remain
      expect(result.current.steps).toHaveLength(4)
    })

    it('should reset entire wizard', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
        result.current.updateState({ topic: 'Test' })
        result.current.completeStep('step1')
      })

      expect(result.current.steps).toHaveLength(4)
      expect(result.current.topic).toBe('Test')

      act(() => {
        result.current.resetWizard()
      })

      expect(result.current.steps).toEqual([])
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.topic).toBeUndefined()
      expect(result.current.isCompleted).toBe(false)
    })
  })

  describe('validation', () => {
    it('should set step validation', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      expect(result.current.canGoNext).toBe(false)

      act(() => {
        result.current.setStepValidation('step1', true)
      })

      expect(result.current.canGoNext).toBe(true)

      act(() => {
        result.current.setStepValidation('step1', false)
      })

      expect(result.current.canGoNext).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      expect(result.current.progress).toBe(25) // 1/4 steps * 100

      act(() => {
        // Complete required steps first
        result.current.completeStep('step1')
        result.current.completeStep('step2')
        result.current.goToStep(2)
      })

      expect(result.current.progress).toBe(75) // 3/4 steps * 100
    })

    it('should count completed steps correctly', () => {
      const { result } = renderHook(() => useWizardState())
      
      act(() => {
        result.current.initializeSteps(mockSteps)
      })

      expect(result.current.completedSteps).toBe(0)

      act(() => {
        result.current.completeStep('step1')
        result.current.completeStep('step3')
      })

      expect(result.current.completedSteps).toBe(2)
    })
  })
})

describe('useWizardStep', () => {
  const mockSteps: Omit<WizardStep, 'isCompleted'>[] = [
    { id: 'step1', title: 'Step 1', isRequired: true },
    { id: 'step2', title: 'Step 2', isRequired: false },
  ]

  beforeEach(() => {
    const { result } = renderHook(() => useWizardState())
    act(() => {
      result.current.resetWizard()
      result.current.initializeSteps(mockSteps)
    })
  })

  it('should return correct step information', () => {
    const { result } = renderHook(() => useWizardStep('step1'))

    expect(result.current.step?.id).toBe('step1')
    expect(result.current.isCurrentStep).toBe(true)
    expect(result.current.stepIndex).toBe(0)
    expect(result.current.isCompleted).toBe(false)
  })

  it('should complete step through hook', () => {
    const { result } = renderHook(() => useWizardStep('step1'))

    const testData = { field: 'value' }
    act(() => {
      result.current.complete(testData)
    })

    expect(result.current.isCompleted).toBe(true)
    expect(result.current.data).toEqual(testData)
  })

  it('should update step data through hook', () => {
    const { result } = renderHook(() => useWizardStep('step1'))

    const testData = { field: 'value' }
    act(() => {
      result.current.updateData(testData)
    })

    expect(result.current.data).toEqual(testData)
  })

  it('should handle navigation through hook', () => {
    const { result: wizardResult } = renderHook(() => useWizardState())
    const { result: stepResult } = renderHook(() => useWizardStep('step1'))

    // Complete step1 to allow navigation
    act(() => {
      stepResult.current.complete()
    })

    act(() => {
      stepResult.current.goNext()
    })

    expect(wizardResult.current.currentStepIndex).toBe(1)

    act(() => {
      stepResult.current.goPrevious()
    })

    expect(wizardResult.current.currentStepIndex).toBe(0)
  })
})