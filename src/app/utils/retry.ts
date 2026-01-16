/**
 * Retry utility with exponential backoff for network operations
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Function to determine if error is retryable (default: network errors only) */
  isRetryable?: (error: Error) => boolean;
  /** Callback fired on each retry attempt */
  onRetry?: (attempt: number, error: Error, nextDelay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  isRetryable: isNetworkError,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onRetry: () => {},
};

/**
 * Determines if an error is a network-related error that should be retried
 */
export function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('socket') ||
    error.name === 'TypeError' // fetch throws TypeError for network failures
  );
}

/**
 * Determines if an HTTP status code is retryable
 */
export function isRetryableStatus(status: number): boolean {
  // Retry on server errors (5xx) and specific client errors
  return (
    status >= 500 || // Server errors
    status === 408 || // Request Timeout
    status === 429 || // Too Many Requests
    status === 0 // Network failure (no response)
  );
}

/**
 * Executes an async function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const data = await withRetry(
 *   () => fetch('https://api.example.com/data'),
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, error) => console.log(`Retry ${attempt}: ${error.message}`)
 *   }
 * );
 * ```
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error = new Error('Unknown error');
  let delay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if we've exhausted attempts or error isn't retryable
      if (attempt === config.maxRetries || !config.isRetryable(lastError)) {
        throw lastError;
      }

      // Calculate next delay with exponential backoff
      const nextDelay = Math.min(delay, config.maxDelay);

      // Notify about retry
      config.onRetry(attempt + 1, lastError, nextDelay);

      // Wait before retrying
      await sleep(nextDelay);

      // Increase delay for next attempt
      delay *= config.backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Fetches a URL with automatic retry on network failures
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retryOptions - Retry configuration
 * @returns Promise resolving to the Response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {},
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);

      // Throw on retryable status codes to trigger retry
      if (!response.ok && isRetryableStatus(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    {
      ...retryOptions,
      isRetryable: (error: Error) => {
        // Check if it's a network error or retryable HTTP status
        if (isNetworkError(error)) return true;

        // Check for HTTP status in error message
        const statusMatch = error.message.match(/HTTP (\d+)/);
        if (statusMatch) {
          return isRetryableStatus(parseInt(statusMatch[1], 10));
        }

        return false;
      },
    },
  );
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
