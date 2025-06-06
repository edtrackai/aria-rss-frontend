import DOMPurify from 'dompurify'

export interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: string[]
  stripTags?: boolean
  maxLength?: number
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
]

const DEFAULT_ALLOWED_ATTRIBUTES = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel', 'width', 'height'
]

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(
  content: string, 
  options: SanitizeOptions = {}
): string {
  if (typeof window === 'undefined') {
    // Server-side fallback - strip all HTML tags
    return stripHTML(content)
  }

  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    maxLength
  } = options

  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    SANITIZE_DOM: true
  }

  let sanitized = DOMPurify.sanitize(content, config)

  // Apply length limit if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...'
  }

  return sanitized
}

/**
 * Strip all HTML tags from content
 */
export function stripHTML(content: string): string {
  return content.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(
  text: string, 
  options: { maxLength?: number; allowLineBreaks?: boolean } = {}
): string {
  const { maxLength, allowLineBreaks = true } = options
  
  let sanitized = text
    .replace(/[<>]/g, '') // Remove potential HTML characters
    .trim()

  if (!allowLineBreaks) {
    sanitized = sanitized.replace(/\r?\n/g, ' ')
  }

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim()
  }

  return sanitized
}

/**
 * Sanitize URLs to prevent javascript: and data: URIs
 */
export function sanitizeURL(url: string): string {
  const trimmed = url.trim().toLowerCase()
  
  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return ''
  }

  // Ensure proper protocol for external links
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return url.trim()
  }

  // Handle relative URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return url.trim()
  }

  // Default to https for domain-only URLs
  if (trimmed.includes('.') && !trimmed.includes('/')) {
    return `https://${url.trim()}`
  }

  return url.trim()
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-_]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase()
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize search queries
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove HTML chars
    .replace(/['"]/g, '') // Remove quotes that could break queries
    .substring(0, 100) // Limit length
}

/**
 * Sanitize article slug
 */
export function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Sanitize text while preserving line breaks
 */
export function sanitizeWithLineBreaks(content: string): string {
  return sanitizeText(content, { allowLineBreaks: true })
}

/**
 * Sanitize metadata for SEO
 */
export function sanitizeMetadata(metadata: {
  title?: string
  description?: string
  keywords?: string[]
}) {
  return {
    title: metadata.title ? sanitizeText(metadata.title, { maxLength: 60 }) : '',
    description: metadata.description ? sanitizeText(metadata.description, { maxLength: 160 }) : '',
    keywords: metadata.keywords ? metadata.keywords.map(k => sanitizeText(k, { maxLength: 50 })) : []
  }
}

export default {
  sanitizeHTML,
  stripHTML,
  sanitizeText,
  sanitizeWithLineBreaks,
  sanitizeURL,
  sanitizeFileName,
  sanitizeEmail,
  sanitizeSearchQuery,
  sanitizeSlug,
  sanitizeMetadata
}