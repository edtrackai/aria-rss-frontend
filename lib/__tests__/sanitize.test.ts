/**
 * @jest-environment jsdom
 */

import {
  sanitizeHTML,
  stripHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeFileName,
  sanitizeEmail,
  sanitizeSearchQuery,
  sanitizeSlug,
  sanitizeWithLineBreaks,
  sanitizeMetadata
} from '../sanitize';

// Mock DOMPurify for consistent testing
jest.mock('dompurify', () => {
  const mockSanitize = jest.fn((dirty: string, config?: any) => {
    // Simple mock implementation
    if (config?.ALLOWED_TAGS && config.ALLOWED_TAGS.length === 0) {
      return dirty.replace(/<[^>]*>/g, '');
    }
    
    // Remove script tags
    let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove event handlers
    clean = clean.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Apply length limit if specified
    if (config?.maxLength && clean.length > config.maxLength) {
      clean = clean.substring(0, config.maxLength) + '...';
    }
    
    return clean;
  });
  
  return {
    default: {
      sanitize: mockSanitize
    }
  };
});

describe('Sanitize utilities', () => {
  describe('sanitizeHTML', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>world</strong>!</p>';
      const result = sanitizeHTML(input);
      expect(result).toBe('<p>Hello <strong>world</strong>!</p>');
    });

    it('should remove script tags', () => {
      const input = '<p>Safe</p><script>alert("XSS")</script>';
      const result = sanitizeHTML(input);
      expect(result).toBe('<p>Safe</p>');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'XSS\')">Click me</div>';
      const result = sanitizeHTML(input);
      expect(result).toBe('<div>Click me</div>');
    });

    it('should respect maxLength option', () => {
      const input = '<p>This is a very long text that should be truncated</p>';
      const result = sanitizeHTML(input, { maxLength: 20 });
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(result).toContain('...');
    });

    it('should handle custom allowed tags', () => {
      const input = '<custom-tag>Content</custom-tag><p>Paragraph</p>';
      const result = sanitizeHTML(input, { allowedTags: ['custom-tag'] });
      expect(result).toContain('custom-tag');
    });

    it('should handle custom allowed attributes', () => {
      const input = '<a href="https://example.com" data-custom="value">Link</a>';
      const result = sanitizeHTML(input, { allowedAttributes: ['href', 'data-custom'] });
      expect(result).toContain('href');
    });

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('');
    });

    it('should handle null/undefined gracefully', () => {
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
    });
  });

  describe('stripHTML', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>world</strong>!</p>';
      const result = stripHTML(input);
      expect(result).toBe('Hello world!');
    });

    it('should handle nested tags', () => {
      const input = '<div><p>Nested <span>content</span></p></div>';
      const result = stripHTML(input);
      expect(result).toBe('Nested content');
    });

    it('should handle self-closing tags', () => {
      const input = 'Text<br />More text<img src="test.jpg" />';
      const result = stripHTML(input);
      expect(result).toBe('TextMore text');
    });

    it('should handle malformed HTML', () => {
      const input = '<p>Unclosed tag <div>content';
      const result = stripHTML(input);
      expect(result).toBe('Unclosed tag content');
    });
  });

  describe('sanitizeText', () => {
    it('should remove HTML characters', () => {
      const input = 'Hello <script>alert("XSS")</script> world';
      const result = sanitizeText(input);
      expect(result).toBe('Hello script>alert("XSS")/script> world');
    });

    it('should trim whitespace', () => {
      const input = '  Hello world  ';
      const result = sanitizeText(input);
      expect(result).toBe('Hello world');
    });

    it('should respect maxLength', () => {
      const input = 'This is a very long text';
      const result = sanitizeText(input, { maxLength: 10 });
      expect(result).toBe('This is a');
    });

    it('should handle line breaks based on option', () => {
      const input = 'Line 1\nLine 2\r\nLine 3';
      
      const withBreaks = sanitizeText(input, { allowLineBreaks: true });
      expect(withBreaks).toBe('Line 1\nLine 2\r\nLine 3');
      
      const withoutBreaks = sanitizeText(input, { allowLineBreaks: false });
      expect(withoutBreaks).toBe('Line 1 Line 2 Line 3');
    });

    it('should handle empty strings', () => {
      expect(sanitizeText('')).toBe('');
      expect(sanitizeText('   ')).toBe('');
    });
  });

  describe('sanitizeURL', () => {
    it('should block javascript: URLs', () => {
      expect(sanitizeURL('javascript:alert("XSS")')).toBe('');
    });

    it('should block data: URLs', () => {
      expect(sanitizeURL('data:text/html,<script>alert("XSS")</script>')).toBe('');
    });

    it('should block vbscript: URLs', () => {
      expect(sanitizeURL('vbscript:msgbox("XSS")')).toBe('');
    });

    it('should block file: URLs', () => {
      expect(sanitizeURL('file:///etc/passwd')).toBe('');
    });

    it('should allow http/https URLs', () => {
      expect(sanitizeURL('http://example.com')).toBe('http://example.com');
      expect(sanitizeURL('https://example.com')).toBe('https://example.com');
    });

    it('should handle relative URLs', () => {
      expect(sanitizeURL('/path/to/page')).toBe('/path/to/page');
      expect(sanitizeURL('./relative')).toBe('./relative');
      expect(sanitizeURL('../parent')).toBe('../parent');
    });

    it('should add https to domain-only URLs', () => {
      expect(sanitizeURL('example.com')).toBe('https://example.com');
      expect(sanitizeURL('sub.example.com')).toBe('https://sub.example.com');
    });

    it('should handle URLs with whitespace', () => {
      expect(sanitizeURL('  https://example.com  ')).toBe('https://example.com');
    });

    it('should be case insensitive for protocols', () => {
      expect(sanitizeURL('JAVASCRIPT:alert("XSS")')).toBe('');
      expect(sanitizeURL('JavaScript:alert("XSS")')).toBe('');
    });

    it('should handle edge cases', () => {
      expect(sanitizeURL('')).toBe('');
      expect(sanitizeURL('not-a-url')).toBe('not-a-url');
    });
  });

  describe('sanitizeFileName', () => {
    it('should replace special characters with underscores', () => {
      const input = 'file@name#with$special%chars.txt';
      const result = sanitizeFileName(input);
      expect(result).toBe('file_name_with_special_chars.txt');
    });

    it('should handle multiple consecutive special characters', () => {
      const input = 'file!!!name.txt';
      const result = sanitizeFileName(input);
      expect(result).toBe('file_name.txt');
    });

    it('should remove leading and trailing underscores', () => {
      const input = '___filename___.txt';
      const result = sanitizeFileName(input);
      expect(result).toBe('filename.txt');
    });

    it('should convert to lowercase', () => {
      const input = 'MyFile.TXT';
      const result = sanitizeFileName(input);
      expect(result).toBe('myfile.txt');
    });

    it('should preserve dots and hyphens', () => {
      const input = 'my-file.name.txt';
      const result = sanitizeFileName(input);
      expect(result).toBe('my-file.name.txt');
    });

    it('should handle empty strings', () => {
      expect(sanitizeFileName('')).toBe('');
    });

    it('should handle file paths', () => {
      const input = '/path/to/file.txt';
      const result = sanitizeFileName(input);
      expect(result).toBe('_path_to_file.txt');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and return valid emails', () => {
      expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
      expect(sanitizeEmail('test.user@example.co.uk')).toBe('test.user@example.co.uk');
    });

    it('should convert to lowercase', () => {
      expect(sanitizeEmail('User@EXAMPLE.COM')).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('should return empty string for invalid emails', () => {
      expect(sanitizeEmail('invalid')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
      expect(sanitizeEmail('user@')).toBe('');
      expect(sanitizeEmail('user@.com')).toBe('');
      expect(sanitizeEmail('user example.com')).toBe('');
    });

    it('should handle special cases', () => {
      expect(sanitizeEmail('')).toBe('');
      expect(sanitizeEmail('user+tag@example.com')).toBe('user+tag@example.com');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove HTML characters', () => {
      const input = 'search <script>alert("XSS")</script> term';
      const result = sanitizeSearchQuery(input);
      expect(result).toBe('search script>alert("XSS")/script> term');
    });

    it('should remove quotes', () => {
      const input = 'search "term" with \'quotes\'';
      const result = sanitizeSearchQuery(input);
      expect(result).toBe('search term with quotes');
    });

    it('should limit length to 100 characters', () => {
      const input = 'a'.repeat(150);
      const result = sanitizeSearchQuery(input);
      expect(result.length).toBe(100);
    });

    it('should trim whitespace', () => {
      const input = '  search term  ';
      const result = sanitizeSearchQuery(input);
      expect(result).toBe('search term');
    });

    it('should handle empty strings', () => {
      expect(sanitizeSearchQuery('')).toBe('');
    });
  });

  describe('sanitizeSlug', () => {
    it('should convert to lowercase', () => {
      const input = 'My Article Title';
      const result = sanitizeSlug(input);
      expect(result).toBe('my-article-title');
    });

    it('should replace spaces with hyphens', () => {
      const input = 'article with spaces';
      const result = sanitizeSlug(input);
      expect(result).toBe('article-with-spaces');
    });

    it('should remove special characters', () => {
      const input = 'Article: With Special Characters!';
      const result = sanitizeSlug(input);
      expect(result).toBe('article-with-special-characters');
    });

    it('should handle multiple consecutive spaces', () => {
      const input = 'article   with   multiple   spaces';
      const result = sanitizeSlug(input);
      expect(result).toBe('article-with-multiple-spaces');
    });

    it('should handle leading and trailing spaces/hyphens', () => {
      const input = '  -article-title-  ';
      const result = sanitizeSlug(input);
      expect(result).toBe('article-title');
    });

    it('should handle unicode characters', () => {
      const input = 'Article with émojis 🎉 and ñ';
      const result = sanitizeSlug(input);
      expect(result).toBe('article-with-mojis-and');
    });

    it('should handle empty strings', () => {
      expect(sanitizeSlug('')).toBe('');
    });

    it('should handle strings with only special characters', () => {
      const input = '!!!@@@###';
      const result = sanitizeSlug(input);
      expect(result).toBe('');
    });
  });

  describe('sanitizeWithLineBreaks', () => {
    it('should preserve line breaks', () => {
      const input = 'Line 1\nLine 2\r\nLine 3';
      const result = sanitizeWithLineBreaks(input);
      expect(result).toBe('Line 1\nLine 2\r\nLine 3');
    });

    it('should remove HTML characters', () => {
      const input = 'Text with <script>alert("XSS")</script>\nNew line';
      const result = sanitizeWithLineBreaks(input);
      expect(result).toBe('Text with script>alert("XSS")/script>\nNew line');
    });

    it('should trim whitespace', () => {
      const input = '  Text with breaks\n  ';
      const result = sanitizeWithLineBreaks(input);
      expect(result).toBe('Text with breaks\n');
    });
  });

  describe('sanitizeMetadata', () => {
    it('should sanitize all metadata fields', () => {
      const input = {
        title: '  Long title that should be truncated because it exceeds the maximum length allowed  ',
        description: 'A very long description that goes on and on and should definitely be truncated to fit within the maximum allowed length for SEO meta descriptions which is typically around 160 characters',
        keywords: ['keyword1', '  keyword2  ', 'very-long-keyword-that-exceeds-the-maximum-allowed-length']
      };
      
      const result = sanitizeMetadata(input);
      
      expect(result.title.length).toBeLessThanOrEqual(60);
      expect(result.title).not.toMatch(/^\s|\s$/); // No leading/trailing spaces
      
      expect(result.description.length).toBeLessThanOrEqual(160);
      
      expect(result.keywords).toHaveLength(3);
      expect(result.keywords[1]).toBe('keyword2'); // Trimmed
      expect(result.keywords[2].length).toBeLessThanOrEqual(50);
    });

    it('should handle missing fields', () => {
      const result = sanitizeMetadata({});
      
      expect(result).toEqual({
        title: '',
        description: '',
        keywords: []
      });
    });

    it('should handle null/undefined values', () => {
      const result = sanitizeMetadata({
        title: null as any,
        description: undefined as any,
        keywords: null as any
      });
      
      expect(result).toEqual({
        title: '',
        description: '',
        keywords: []
      });
    });
  });

  describe('Default export', () => {
    it('should export all functions', async () => {
      const defaultExport = (await import('../sanitize')).default;
      
      expect(defaultExport).toHaveProperty('sanitizeHTML');
      expect(defaultExport).toHaveProperty('stripHTML');
      expect(defaultExport).toHaveProperty('sanitizeText');
      expect(defaultExport).toHaveProperty('sanitizeWithLineBreaks');
      expect(defaultExport).toHaveProperty('sanitizeURL');
      expect(defaultExport).toHaveProperty('sanitizeFileName');
      expect(defaultExport).toHaveProperty('sanitizeEmail');
      expect(defaultExport).toHaveProperty('sanitizeSearchQuery');
      expect(defaultExport).toHaveProperty('sanitizeSlug');
      expect(defaultExport).toHaveProperty('sanitizeMetadata');
    });
  });

  describe('Server-side rendering', () => {
    it('should fallback to stripHTML when window is undefined', () => {
      const originalWindow = global.window;
      (global as any).window = undefined;
      
      const input = '<p>Hello <strong>world</strong>!</p>';
      const result = sanitizeHTML(input);
      
      expect(result).toBe('Hello world!');
      
      (global as any).window = originalWindow;
    });
  });
});