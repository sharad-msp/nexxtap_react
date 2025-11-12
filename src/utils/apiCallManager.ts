// API Call Manager to prevent multiple simultaneous requests
class ApiCallManager {
  private activeCalls: Map<string, boolean> = new Map();
  private callTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Execute an API call with protection against multiple simultaneous calls
   */
  async executeWithProtection<T>(
    callId: string,
    apiFunction: () => Promise<T>,
    options: {
      debounceMs?: number;
      preventMultiple?: boolean;
    } = {}
  ): Promise<T | null> {
    const { debounceMs = 0, preventMultiple = true } = options;

    // Check if call is already in progress
    if (preventMultiple && this.activeCalls.get(callId)) {
      return null;
    }

    // Clear existing timeout if any
    const existingTimeout = this.callTimeouts.get(callId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        try {
          this.activeCalls.set(callId, true);
          const result = await apiFunction();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeCalls.delete(callId);
          this.callTimeouts.delete(callId);
        }
      }, debounceMs);

      this.callTimeouts.set(callId, timeoutId);
    });
  }

  /**
   * Cancel an active API call
   */
  cancelCall(callId: string): void {
    const timeoutId = this.callTimeouts.get(callId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.callTimeouts.delete(callId);
    }
    this.activeCalls.delete(callId);
  }

  /**
   * Check if a call is currently active
   */
  isCallActive(callId: string): boolean {
    return this.activeCalls.has(callId);
  }

  /**
   * Clear all active calls
   */
  clearAllCalls(): void {
    this.callTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.callTimeouts.clear();
    this.activeCalls.clear();
  }
}

// Global instance
export const apiCallManager = new ApiCallManager();

// Helper function to create unique call IDs
export const createCallId = (module: string, action: string, ...params: any[]): string => {
  return `${module}_${action}_${JSON.stringify(params)}`;
};

// Hook for React components
export const useApiCallManager = () => {
  return {
    executeWithProtection: apiCallManager.executeWithProtection.bind(apiCallManager),
    cancelCall: apiCallManager.cancelCall.bind(apiCallManager),
    isCallActive: apiCallManager.isCallActive.bind(apiCallManager),
    clearAllCalls: apiCallManager.clearAllCalls.bind(apiCallManager),
  };
};
