/**
 * Image optimization utilities for fast loading
 */

export const IMAGE_OPTIMIZATION = {
  // Standard image quality for Web (higher quality than default)
  quality: 85,
  
  // Common responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },

  // Image format preferences (WebP for modern browsers, PNG fallback)
  formats: ['image/webp', 'image/png', 'image/jpeg'],

  // Lazy loading configuration
  lazyLoad: {
    loading: 'lazy' as const,
    decoding: 'async' as const,
  },
};

/**
 * Generate optimized image sizes string for srcSet
 * Use in <img sizes="..." /> for responsive images
 */
export const generateImageSizes = (
  mobileWidth: number,
  tabletWidth: number,
  desktopWidth: number
): string => {
  return `
    (max-width: 640px) ${mobileWidth}px,
    (max-width: 1024px) ${tabletWidth}px,
    ${desktopWidth}px
  `.trim();
};

/**
 * Get optimized srcSet for Next.js Image component
 * Automatically handles WebP and format fallback
 */
export const getOptimizedImageProps = (
  src: string,
  alt: string,
  options?: {
    priority?: boolean;
    width?: number;
    height?: number;
    quality?: number;
  }
) => {
  return {
    src,
    alt,
    loading: options?.priority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    quality: options?.quality || IMAGE_OPTIMIZATION.quality,
    width: options?.width,
    height: options?.height,
  };
};
