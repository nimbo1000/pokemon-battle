/**
 * Utility functions for debug mode management
 */

/**
 * Check if debug mode is enabled
 * Debug mode is enabled if:
 * - We're in development mode (import.meta.env.DEV is true)
 * - OR the VITE_DEBUG_MODE environment variable is set to 'true'
 */
export const isDebugMode = (): boolean => {
  return import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE === 'true';
};

/**
 * Log a debug message only if debug mode is enabled
 */
export const debugLog = (message: string, ...args: unknown[]): void => {
  if (isDebugMode()) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

/**
 * Log a debug error only if debug mode is enabled
 */
export const debugError = (message: string, ...args: unknown[]): void => {
  if (isDebugMode()) {
    console.error(`[DEBUG ERROR] ${message}`, ...args);
  }
};

/**
 * Log a debug warning only if debug mode is enabled
 */
export const debugWarn = (message: string, ...args: unknown[]): void => {
  if (isDebugMode()) {
    console.warn(`[DEBUG WARN] ${message}`, ...args);
  }
};

/**
 * Get debug mode status as a string for display
 */
export const getDebugModeStatus = (): string => {
  if (import.meta.env.DEV) {
    return 'Development Mode';
  } else if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    return 'Production Debug Mode';
  } else {
    return 'Production Mode (Debug Disabled)';
  }
}; 