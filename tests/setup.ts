// Global Jest setup
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalled(): R;
      toBeDefined(): R;
      toBe(value: any): R;
    }
  }
}

// Export to make this a module
export {};