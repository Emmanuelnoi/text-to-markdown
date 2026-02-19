export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  isRetryable?: (error: Error) => boolean;
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
    error.name === 'TypeError'
  );
}

export function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 408 || status === 429 || status === 0;
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error = new Error('Unknown error');
  let delay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === config.maxRetries || !config.isRetryable(lastError)) {
        throw lastError;
      }

      const nextDelay = Math.min(delay, config.maxDelay);
      config.onRetry(attempt + 1, lastError, nextDelay);
      await sleep(nextDelay);
      delay *= config.backoffMultiplier;
    }
  }

  throw lastError;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {},
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);

      if (!response.ok && isRetryableStatus(response.status)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    {
      ...retryOptions,
      isRetryable: (error: Error) => {
        if (isNetworkError(error)) return true;

        const statusMatch = error.message.match(/HTTP (\d+)/);
        if (statusMatch) {
          return isRetryableStatus(parseInt(statusMatch[1], 10));
        }

        return false;
      },
    },
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
