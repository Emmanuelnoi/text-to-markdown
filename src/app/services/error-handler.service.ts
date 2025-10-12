import { ErrorHandler, Injectable, inject } from '@angular/core';
import { AlertService } from './alert.service';

/**
 * Global error handler that catches all unhandled errors in the application
 * and provides user-friendly error messages
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private alertService = inject(AlertService);

  handleError(error: Error): void {
    // Log error to console for debugging
    console.error('Global error caught:', error);

    // Get user-friendly message
    const message = this.getUserFriendlyMessage(error);

    // Show alert to user
    this.alertService.error('Error Occurred', message, true, 5000);

    // In production, you could send to error tracking service like Sentry
    // Example: Sentry.captureException(error);
  }

  /**
   * Converts technical error messages to user-friendly messages
   */
  private getUserFriendlyMessage(error: Error): string {
    const errorMessage = error.message.toLowerCase();

    // Network errors
    if (errorMessage.includes('http') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    // Storage errors
    if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
      return 'Storage quota exceeded. Please clear some browser data and try again.';
    }

    // File errors
    if (errorMessage.includes('file') && errorMessage.includes('not found')) {
      return 'File not found. Please select a valid file.';
    }

    // Permission errors
    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
      return 'Permission denied. Please check your browser settings.';
    }

    // Timeout errors
    if (errorMessage.includes('timeout')) {
      return 'Operation timed out. Please try again.';
    }

    // Default error message
    return 'An unexpected error occurred. Please try refreshing the page.';
  }
}
