import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRetry, fetchWithRetry, isNetworkError, isRetryableStatus } from './retry';

describe('Retry Utilities', () => {
  describe('isNetworkError', () => {
    it('should return true for network-related errors', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true);
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new Error('Connection timeout'))).toBe(true);
      expect(isNetworkError(new Error('Socket error'))).toBe(true);
    });

    it('should return true for TypeError (fetch network failure)', () => {
      const error = new TypeError('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      expect(isNetworkError(new Error('Invalid JSON'))).toBe(false);
      expect(isNetworkError(new Error('Permission denied'))).toBe(false);
      expect(isNetworkError(new Error('File not found'))).toBe(false);
    });
  });

  describe('isRetryableStatus', () => {
    it('should return true for 5xx server errors', () => {
      expect(isRetryableStatus(500)).toBe(true);
      expect(isRetryableStatus(502)).toBe(true);
      expect(isRetryableStatus(503)).toBe(true);
      expect(isRetryableStatus(504)).toBe(true);
    });

    it('should return true for specific retryable status codes', () => {
      expect(isRetryableStatus(408)).toBe(true); // Request Timeout
      expect(isRetryableStatus(429)).toBe(true); // Too Many Requests
      expect(isRetryableStatus(0)).toBe(true); // Network failure
    });

    it('should return false for non-retryable status codes', () => {
      expect(isRetryableStatus(200)).toBe(false);
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(401)).toBe(false);
      expect(isRetryableStatus(403)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, { maxRetries: 0 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, {
        maxRetries: 1,
        initialDelay: 1, // Use minimal delay for tests
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after exhausting all retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(withRetry(fn, { maxRetries: 1, initialDelay: 1 })).rejects.toThrow(
        'Network error',
      );

      expect(fn).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should not retry non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Invalid JSON'));

      await expect(withRetry(fn, { maxRetries: 3, initialDelay: 1 })).rejects.toThrow(
        'Invalid JSON',
      );
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const onRetry = vi.fn();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      await withRetry(fn, { maxRetries: 1, initialDelay: 1, onRetry });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
    });

    it('should respect custom isRetryable function', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Custom error'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, {
        maxRetries: 1,
        initialDelay: 1,
        isRetryable: error => error.message === 'Custom error',
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle non-Error rejections', async () => {
      const fn = vi.fn().mockRejectedValue('string error');

      await expect(withRetry(fn, { maxRetries: 0, initialDelay: 1 })).rejects.toThrow(
        'string error',
      );
    });
  });

  describe('fetchWithRetry', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should return response on successful fetch', async () => {
      const mockResponse = new Response('data', { status: 200 });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const response = await fetchWithRetry('https://example.com/api', {}, { maxRetries: 0 });

      expect(response.status).toBe(200);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return response on non-retryable HTTP status', async () => {
      const mockResponse = new Response('Not Found', { status: 404 });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const response = await fetchWithRetry('https://example.com/api', {}, { maxRetries: 1 });

      expect(response.status).toBe(404);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 5xx server errors', async () => {
      const mockError = new Response('Server Error', { status: 503 });
      const mockSuccess = new Response('OK', { status: 200 });
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockError).mockResolvedValue(mockSuccess);

      const response = await fetchWithRetry(
        'https://example.com/api',
        {},
        { maxRetries: 1, initialDelay: 1 },
      );

      expect(response.status).toBe(200);
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw on network errors after retries exhausted', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        fetchWithRetry('https://example.com/api', {}, { maxRetries: 1, initialDelay: 1 }),
      ).rejects.toThrow('Failed to fetch');

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
