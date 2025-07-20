/**
 * Error handling utilities for Strapi controllers
 */

export interface StrapiError {
  message: string;
  name?: string;
  stack?: string;
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Create a standardized error response for Strapi controllers
 */
export function createErrorResponse(error: unknown, defaultMessage: string) {
  return {
    error: getErrorMessage(error),
    message: defaultMessage
  };
}

/**
 * Type guard to check if an object has a message property
 */
export function hasMessage(obj: unknown): obj is { message: string } {
  return obj !== null && typeof obj === 'object' && 'message' in obj;
} 