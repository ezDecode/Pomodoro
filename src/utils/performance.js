// Performance monitoring and optimization utilities

// Performance metrics tracking
export const performanceMetrics = {
  fontLoadTime: 0,
  soundLoadTime: 0,
  renderTime: 0,
  interactionDelay: 0
}

// Monitor font loading performance
export function monitorFontLoading() {
  if ('fonts' in document) {
    const startTime = performance.now()
    
    document.fonts.ready.then(() => {
      performanceMetrics.fontLoadTime = performance.now() - startTime
      console.log(`Fonts loaded in ${performanceMetrics.fontLoadTime.toFixed(2)}ms`)
    })
  }
}

// Monitor sound loading performance
export function monitorSoundLoading() {
  const startTime = performance.now()
  
  // Create a test audio element to measure load time
  const testAudio = new Audio('/sound/completionSound.mp3')
  testAudio.addEventListener('canplaythrough', () => {
    performanceMetrics.soundLoadTime = performance.now() - startTime
    console.log(`Sound loaded in ${performanceMetrics.soundLoadTime.toFixed(2)}ms`)
  })
  
  testAudio.load()
}

// Lazy load non-critical components
export function lazyLoadComponent(importFunction) {
  return React.lazy(importFunction)
}

// Debounce function for performance optimization
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for performance optimization
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  monitorFontLoading()
  monitorSoundLoading()
  
  // Monitor render performance
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          performanceMetrics.renderTime = entry.duration
        }
      }
    })
    observer.observe({ entryTypes: ['measure'] })
  }
}
