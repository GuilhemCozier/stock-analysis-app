import { ErrorType, JobError } from './types';

/**
 * Classify error and determine retry strategy
 */
export function classifyError(error: unknown): JobError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Rate limit errors - always retryable with longer delay
  if (
    errorString.includes('rate limit') ||
    errorString.includes('429') ||
    errorString.includes('too many requests')
  ) {
    return {
      type: ErrorType.RATE_LIMIT,
      message: errorMessage,
      retryable: true,
      retryDelay: 60000, // 1 minute delay
    };
  }

  // API errors (4xx) - some are retryable
  if (
    errorString.includes('400') ||
    errorString.includes('bad request') ||
    errorString.includes('invalid')
  ) {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: errorMessage,
      retryable: false, // Don't retry validation errors
    };
  }

  if (
    errorString.includes('401') ||
    errorString.includes('403') ||
    errorString.includes('unauthorized')
  ) {
    return {
      type: ErrorType.API_ERROR,
      message: errorMessage,
      retryable: false, // Don't retry auth errors
    };
  }

  // Network/timeout errors - retryable
  if (
    errorString.includes('network') ||
    errorString.includes('timeout') ||
    errorString.includes('econnrefused') ||
    errorString.includes('enotfound')
  ) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: errorMessage,
      retryable: true,
      retryDelay: 10000, // 10 second delay
    };
  }

  // Judge rejection - special handling
  if (errorString.includes('judge reject')) {
    return {
      type: ErrorType.JUDGE_REJECTION,
      message: errorMessage,
      retryable: true, // Retry with variation
      retryDelay: 5000, // 5 second delay
    };
  }

  // Unknown errors - retry with caution
  return {
    type: ErrorType.UNKNOWN,
    message: errorMessage,
    retryable: true,
    retryDelay: 5000,
  };
}

/**
 * Determine if error should be retried based on attempt number
 */
export function shouldRetry(
  error: JobError,
  attemptNumber: number,
  maxAttempts = 3
): boolean {
  // Don't retry if not retryable
  if (!error.retryable) {
    return false;
  }

  // Don't retry if we've exceeded max attempts
  if (attemptNumber >= maxAttempts) {
    return false;
  }

  return true;
}

/**
 * Calculate delay before retry with exponential backoff
 */
export function calculateRetryDelay(
  error: JobError,
  attemptNumber: number,
  baseDelay = 5000
): number {
  // Use error-specific delay if provided
  const initialDelay = error.retryDelay || baseDelay;

  // Exponential backoff: delay * (2 ^ attemptNumber)
  return initialDelay * Math.pow(2, attemptNumber - 1);
}

/**
 * Format error for logging and storage
 */
export function formatErrorMessage(error: unknown, context?: string): string {
  const baseMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  let message = context ? `${context}: ${baseMessage}` : baseMessage;

  // Add stack trace for debugging (truncate if too long)
  if (stack) {
    const truncatedStack = stack.slice(0, 1000);
    message += `\n\nStack trace:\n${truncatedStack}`;
  }

  return message;
}

/**
 * Check if error is from Anthropic API
 */
export function isAnthropicError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Anthropic') ||
      error.message.includes('Claude') ||
      'status' in error // Anthropic SDK errors have status property
    );
  }
  return false;
}

/**
 * Extract retry-after header value from rate limit errors
 */
export function getRetryAfter(error: unknown): number | null {
  if (error && typeof error === 'object' && 'headers' in error) {
    const headers = error.headers as Record<string, string>;
    const retryAfter = headers['retry-after'] || headers['Retry-After'];

    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      return isNaN(seconds) ? null : seconds * 1000; // Convert to milliseconds
    }
  }
  return null;
}

/**
 * Wrap async function with error handling and retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    onRetry?: (attempt: number, error: JobError) => void;
    context?: string;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, onRetry, context } = options;
  let lastError: JobError | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = classifyError(error);

      // Check if we should retry
      if (!shouldRetry(lastError, attempt, maxAttempts)) {
        throw new Error(formatErrorMessage(error, context));
      }

      // Calculate delay
      const delay = calculateRetryDelay(lastError, attempt);

      // Notify about retry
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  throw new Error(
    formatErrorMessage(
      lastError?.message || 'Unknown error after retries',
      context
    )
  );
}
