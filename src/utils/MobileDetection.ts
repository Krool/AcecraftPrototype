export class MobileDetection {
  static isMobile(): boolean {
    // Check if device is mobile based on user agent and touch support
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    return isMobileUA || (hasTouch && window.innerWidth < 1024)
  }

  static getAvailableHeight(): number {
    // Use Visual Viewport API if available (better for mobile)
    if (window.visualViewport) {
      return window.visualViewport.height
    }

    // Fallback to innerHeight
    return window.innerHeight
  }

  static getScreenHeight(): number {
    return window.innerHeight
  }

  static hasBrowserBar(): boolean {
    // Detect if browser bar is taking up space
    if (window.visualViewport) {
      const diff = window.innerHeight - window.visualViewport.height
      return diff > 50 // If difference is more than 50px, assume browser bar is present
    }
    return false
  }

  static getVerticalSpacingMultiplier(): number {
    // Return a multiplier to compress vertical spacing on mobile with browser bar
    if (!this.isMobile()) {
      return 1.0 // Full spacing on desktop
    }

    const availableHeight = this.getAvailableHeight()

    // Compress spacing based on available height
    if (availableHeight < 600) {
      return 0.6 // Very compressed for small screens
    } else if (availableHeight < 700) {
      return 0.75 // Moderately compressed
    } else if (availableHeight < 800) {
      return 0.85 // Slightly compressed
    }

    return 1.0 // Full spacing
  }

  static getCompactYPosition(baseY: number, sceneHeight: number): number {
    // Adjust Y position based on mobile detection
    if (!this.isMobile()) {
      return baseY
    }

    const multiplier = this.getVerticalSpacingMultiplier()
    const center = sceneHeight / 2
    const offset = baseY - center

    return center + (offset * multiplier)
  }

  static getFontSizeMultiplier(): number {
    // Scale down fonts on mobile to fit smaller screens
    if (!this.isMobile()) {
      return 1.0 // Full size on desktop
    }

    const availableHeight = this.getAvailableHeight()

    // Scale fonts based on available height
    if (availableHeight < 600) {
      return 0.7 // Very small fonts for tiny screens
    } else if (availableHeight < 700) {
      return 0.8 // Smaller fonts
    } else if (availableHeight < 800) {
      return 0.9 // Slightly smaller
    }

    return 1.0 // Full size
  }

  static scaleFontSize(baseFontSize: number): string {
    // Helper to scale a font size value
    const scaled = Math.floor(baseFontSize * this.getFontSizeMultiplier())
    return `${scaled}px`
  }
}
