import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge single class', () => {
    const result = cn('text-red-500');
    expect(result).toBe('text-red-500');
  });

  it('should merge multiple classes', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('should handle conditional classes from clsx', () => {
    const isActive = true;
    const isDisabled = false;
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    );
    
    expect(result).toBe('base-class active-class');
  });

  it('should merge and deduplicate Tailwind classes', () => {
    const result = cn('p-4 px-2', 'px-4');
    expect(result).toBe('p-4 px-4'); // px-4 should override px-2
  });

  it('should handle object syntax', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': false,
      'font-bold': true
    });
    
    expect(result).toBe('text-red-500 font-bold');
  });

  it('should handle array syntax', () => {
    const result = cn(['text-sm', 'font-medium'], 'text-gray-700');
    expect(result).toBe('text-sm font-medium text-gray-700');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('should handle empty strings', () => {
    const result = cn('start', '', 'end');
    expect(result).toBe('start end');
  });

  it('should merge conflicting Tailwind utilities correctly', () => {
    // Testing various Tailwind class conflicts
    expect(cn('text-sm text-lg')).toBe('text-lg');
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500');
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('m-2 mx-4')).toBe('m-2 mx-4');
    expect(cn('hover:bg-red-500 hover:bg-blue-500')).toBe('hover:bg-blue-500');
  });

  it('should preserve important modifiers', () => {
    const result = cn('text-red-500', '!text-blue-500');
    expect(result).toBe('!text-blue-500');
  });

  it('should handle responsive modifiers', () => {
    const result = cn('text-sm', 'md:text-lg', 'lg:text-xl');
    expect(result).toBe('text-sm md:text-lg lg:text-xl');
  });

  it('should handle dark mode classes', () => {
    const result = cn('bg-white', 'dark:bg-gray-900');
    expect(result).toBe('bg-white dark:bg-gray-900');
  });

  it('should handle arbitrary values', () => {
    const result = cn('w-[100px]', 'h-[200px]', 'text-[#123456]');
    expect(result).toBe('w-[100px] h-[200px] text-[#123456]');
  });

  it('should handle complex real-world scenarios', () => {
    const baseButton = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors';
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    };
    
    const result = cn(
      baseButton,
      variants.primary,
      'disabled:pointer-events-none disabled:opacity-50',
      'px-4 py-2'
    );
    
    expect(result).toContain('inline-flex');
    expect(result).toContain('bg-primary');
    expect(result).toContain('disabled:opacity-50');
    expect(result).toContain('px-4 py-2');
  });

  it('should handle CSS variables', () => {
    const result = cn(
      'text-[hsl(var(--primary))]',
      'bg-[hsl(var(--secondary))]'
    );
    
    expect(result).toBe('text-[hsl(var(--primary))] bg-[hsl(var(--secondary))]');
  });

  it('should handle animation classes', () => {
    const result = cn(
      'animate-spin',
      'animation-duration-1000',
      'animate-pulse' // This should override animate-spin
    );
    
    expect(result).toBe('animation-duration-1000 animate-pulse');
  });

  it('should handle pseudo-classes and pseudo-elements', () => {
    const result = cn(
      'before:content-[""]',
      'after:absolute',
      'hover:scale-105',
      'focus:outline-none',
      'focus-visible:ring-2'
    );
    
    expect(result).toContain('before:content-[""]');
    expect(result).toContain('hover:scale-105');
    expect(result).toContain('focus-visible:ring-2');
  });

  it('should handle group and peer modifiers', () => {
    const result = cn(
      'group-hover:text-blue-500',
      'peer-focus:ring-2',
      'group-[.is-active]:bg-gray-100'
    );
    
    expect(result).toBe('group-hover:text-blue-500 peer-focus:ring-2 group-[.is-active]:bg-gray-100');
  });

  it('should work with no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle deeply nested arrays', () => {
    const result = cn([
      'base',
      ['nested-1', ['nested-2', 'nested-3']],
      'end'
    ]);
    
    expect(result).toBe('base nested-1 nested-2 nested-3 end');
  });

  it('should handle mixed input types', () => {
    const condition = true;
    const styles = {
      active: 'bg-blue-500',
      disabled: 'opacity-50'
    };
    
    const result = cn(
      'base-class',
      condition && styles.active,
      { [styles.disabled]: false },
      ['array-class-1', 'array-class-2'],
      undefined,
      null,
      ''
    );
    
    expect(result).toBe('base-class bg-blue-500 array-class-1 array-class-2');
  });

  it('should handle number inputs gracefully', () => {
    // Numbers might be passed accidentally
    const result = cn('text-sm', 123 as any, 'font-bold');
    expect(result).toBe('text-sm 123 font-bold');
  });

  it('should deduplicate identical classes', () => {
    const result = cn(
      'text-red-500',
      'text-red-500',
      'text-red-500'
    );
    
    expect(result).toBe('text-red-500');
  });

  it('should handle Tailwind arbitrary properties', () => {
    const result = cn(
      '[mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]',
      '[&::-webkit-scrollbar]:hidden'
    );
    
    expect(result).toContain('[mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]');
    expect(result).toContain('[&::-webkit-scrollbar]:hidden');
  });

  it('should work with CSS modules', () => {
    const styles = {
      button: 'Button_module_123',
      active: 'Button_active_456'
    };
    
    const result = cn(
      styles.button,
      'px-4 py-2',
      styles.active
    );
    
    expect(result).toBe('Button_module_123 px-4 py-2 Button_active_456');
  });

  it('should handle container queries', () => {
    const result = cn(
      '@container/sidebar:text-sm',
      '@lg:grid-cols-3',
      '@[500px]:block'
    );
    
    expect(result).toBe('@container/sidebar:text-sm @lg:grid-cols-3 @[500px]:block');
  });

  it('should preserve whitespace in content values', () => {
    const result = cn(
      'before:content-["Hello_World"]',
      'after:content-["_"]'
    );
    
    expect(result).toContain('before:content-["Hello_World"]');
    expect(result).toContain('after:content-["_"]');
  });

  describe('Performance', () => {
    it('should handle large number of classes efficiently', () => {
      const classes = Array.from({ length: 1000 }, (_, i) => `class-${i}`);
      const start = performance.now();
      const result = cn(...classes);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
      expect(result.split(' ').length).toBe(1000);
    });
  });
});