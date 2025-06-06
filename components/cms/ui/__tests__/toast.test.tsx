import React from 'react'
import { render, screen } from '@testing-library/react'
import { useToast, toast, reducer } from '../use-toast'

describe('Toast System', () => {
  describe('useToast hook', () => {
    it('provides toast function', () => {
      let toastFunction: any
      
      const TestComponent = () => {
        const { toast } = useToast()
        toastFunction = toast
        return null
      }
      
      render(<TestComponent />)
      
      expect(typeof toastFunction).toBe('function')
    })

    it('provides dismiss function', () => {
      let dismissFunction: any
      
      const TestComponent = () => {
        const { dismiss } = useToast()
        dismissFunction = dismiss
        return null
      }
      
      render(<TestComponent />)
      
      expect(typeof dismissFunction).toBe('function')
    })

    it('provides toasts array', () => {
      let toasts: any
      
      const TestComponent = () => {
        const toastState = useToast()
        toasts = toastState.toasts
        return null
      }
      
      render(<TestComponent />)
      
      expect(Array.isArray(toasts)).toBe(true)
    })
  })

  describe('toast function', () => {
    it('returns toast control object', () => {
      const result = toast({ title: 'Test' })
      
      expect(result).toHaveProperty('id')
      expect(typeof result.id).toBe('string')
      expect(typeof result.dismiss).toBe('function')
      expect(typeof result.update).toBe('function')
    })

    it('accepts title and description', () => {
      const result = toast({
        title: 'Test Title',
        description: 'Test Description'
      })
      
      expect(result.id).toBeTruthy()
    })

    it('accepts variant', () => {
      const result = toast({
        variant: 'destructive',
        title: 'Error Toast'
      })
      
      expect(result.id).toBeTruthy()
    })
  })

  describe('reducer', () => {
    const initialState = { toasts: [] }

    it('handles ADD_TOAST action', () => {
      const mockToast = {
        id: 'test-1',
        title: 'Test Toast',
        open: true,
        onOpenChange: jest.fn()
      }

      const action = {
        type: 'ADD_TOAST' as const,
        toast: mockToast
      }

      const newState = reducer(initialState, action)

      expect(newState.toasts).toHaveLength(1)
      expect(newState.toasts[0]).toEqual(mockToast)
    })

    it('handles UPDATE_TOAST action', () => {
      const existingToast = {
        id: 'test-1',
        title: 'Original Title',
        open: true,
        onOpenChange: jest.fn()
      }

      const stateWithToast = { toasts: [existingToast] }

      const action = {
        type: 'UPDATE_TOAST' as const,
        toast: { id: 'test-1', title: 'Updated Title' }
      }

      const newState = reducer(stateWithToast, action)

      expect(newState.toasts[0].title).toBe('Updated Title')
      expect(newState.toasts[0].id).toBe('test-1')
    })

    it('handles DISMISS_TOAST action', () => {
      const existingToast = {
        id: 'test-1',
        title: 'Test Toast',
        open: true,
        onOpenChange: jest.fn()
      }

      const stateWithToast = { toasts: [existingToast] }

      const action = {
        type: 'DISMISS_TOAST' as const,
        toastId: 'test-1'
      }

      const newState = reducer(stateWithToast, action)

      expect(newState.toasts[0].open).toBe(false)
    })

    it('handles REMOVE_TOAST action', () => {
      const existingToast = {
        id: 'test-1',
        title: 'Test Toast',
        open: true,
        onOpenChange: jest.fn()
      }

      const stateWithToast = { toasts: [existingToast] }

      const action = {
        type: 'REMOVE_TOAST' as const,
        toastId: 'test-1'
      }

      const newState = reducer(stateWithToast, action)

      expect(newState.toasts).toHaveLength(0)
    })

    it('enforces TOAST_LIMIT', () => {
      const toast1 = {
        id: 'test-1',
        title: 'Toast 1',
        open: true,
        onOpenChange: jest.fn()
      }

      const toast2 = {
        id: 'test-2',
        title: 'Toast 2',
        open: true,
        onOpenChange: jest.fn()
      }

      const action1 = {
        type: 'ADD_TOAST' as const,
        toast: toast1
      }

      const action2 = {
        type: 'ADD_TOAST' as const,
        toast: toast2
      }

      let state = reducer(initialState, action1)
      state = reducer(state, action2)

      // With TOAST_LIMIT = 1, only the latest toast should remain
      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('test-2')
    })
  })

  describe('toast system integration', () => {
    it('generates unique IDs for toasts', () => {
      const toast1 = toast({ title: 'First' })
      const toast2 = toast({ title: 'Second' })
      
      expect(toast1.id).not.toBe(toast2.id)
      expect(typeof toast1.id).toBe('string')
      expect(typeof toast2.id).toBe('string')
    })

    it('supports dismissing specific toast', () => {
      const toastResult = toast({ title: 'Dismissable' })
      
      expect(typeof toastResult.dismiss).toBe('function')
      
      // Should not throw when calling dismiss
      expect(() => toastResult.dismiss()).not.toThrow()
    })

    it('supports updating toast', () => {
      const toastResult = toast({ title: 'Original' })
      
      expect(typeof toastResult.update).toBe('function')
      
      // Should not throw when calling update
      expect(() => toastResult.update({ title: 'Updated' })).not.toThrow()
    })
  })
})