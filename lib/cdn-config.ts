/**
 * CDN Configuration and URL generation utilities
 */

export interface CDNConfig {
  baseUrl: string
  imageFormats: string[]
  videoFormats: string[]
  allowedDomains: string[]
  maxFileSize: number
  imageSizes: Record<string, { width: number; height?: number; quality?: number }>
  preconnectDomains: string[]
  dnsPrefetchDomains: string[]
  preloadResources: Array<{
    href: string
    as: string
    type?: string
    crossOrigin?: string
  }>
}

export const CDN_CONFIG: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.newshub.com',
  imageFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
  videoFormats: ['mp4', 'webm', 'mov'],
  allowedDomains: [
    'newshub.com',
    'cdn.newshub.com',
    'images.unsplash.com',
    'via.placeholder.com',
    'picsum.photos',
  ],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  imageSizes: {
    thumbnail: { width: 150, height: 150, quality: 80 },
    small: { width: 300, height: 200, quality: 85 },
    medium: { width: 600, height: 400, quality: 85 },
    large: { width: 1200, height: 800, quality: 90 },
    hero: { width: 1920, height: 1080, quality: 95 },
    avatar: { width: 100, height: 100, quality: 90 },
    card: { width: 400, height: 250, quality: 85 },
  },
  preconnectDomains: [
    'https://cdn.newshub.com',
    'https://images.unsplash.com',
  ],
  dnsPrefetchDomains: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  preloadResources: []
}

/**
 * Generate optimized image URL with CDN transformations
 */
export function generateImageUrl(
  originalUrl: string,
  options: {
    size?: keyof typeof CDN_CONFIG.imageSizes
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
    blur?: number
    sharpen?: boolean
  } = {}
): string {
  // If URL is already from our CDN, return as is
  if (originalUrl.startsWith(CDN_CONFIG.baseUrl)) {
    return originalUrl
  }

  // Check if the domain is allowed
  const isAllowedDomain = CDN_CONFIG.allowedDomains.some(domain => 
    originalUrl.includes(domain)
  )

  if (!isAllowedDomain && !originalUrl.startsWith('/')) {
    console.warn('Image URL from unauthorized domain:', originalUrl)
    return originalUrl
  }

  const {
    size,
    width,
    height,
    quality = 85,
    format = 'auto',
    fit = 'cover',
    blur,
    sharpen = false,
  } = options

  // Build transformation parameters
  const params = new URLSearchParams()

  // Use predefined size or custom dimensions
  if (size && CDN_CONFIG.imageSizes[size]) {
    const sizeConfig = CDN_CONFIG.imageSizes[size]
    params.append('w', sizeConfig.width.toString())
    if (sizeConfig.height) {
      params.append('h', sizeConfig.height.toString())
    }
    params.append('q', (sizeConfig.quality || quality).toString())
  } else {
    if (width) params.append('w', width.toString())
    if (height) params.append('h', height.toString())
    params.append('q', quality.toString())
  }

  // Add format
  if (format !== 'auto') {
    params.append('f', format)
  } else {
    params.append('f', 'auto')
  }

  // Add fit mode
  params.append('fit', fit)

  // Add optional effects
  if (blur) params.append('blur', blur.toString())
  if (sharpen) params.append('sharpen', '1')

  // Encode the original URL
  const encodedUrl = encodeURIComponent(originalUrl)

  return `${CDN_CONFIG.baseUrl}/image?url=${encodedUrl}&${params.toString()}`
}

/**
 * Check if URL is from an allowed domain
 */
export function isAllowedImageDomain(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return CDN_CONFIG.allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

export default {
  generateImageUrl,
  isAllowedImageDomain,
  CDN_CONFIG,
}