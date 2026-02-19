import { ErrorHandler, Injectable, inject } from '@angular/core';
import { AlertService } from './alert.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private alertService = inject(AlertService);

  handleError(error: Error): void {
    console.error('Global error caught:', error);
    const message = this.getUserFriendlyMessage(error);
    this.alertService.error('Error Occurred', message, true, 5000);
  }

  private getUserFriendlyMessage(error: Error): string {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('http') || errorMessage.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
      return 'Storage quota exceeded. Please clear some browser data and try again.';
    }

    if (errorMessage.includes('file') && errorMessage.includes('not found')) {
      return 'File not found. Please select a valid file.';
    }

    if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
      return 'Permission denied. Please check your browser settings.';
    }

    if (errorMessage.includes('timeout')) {
      return 'Operation timed out. Please try again.';
    }

    return 'An unexpected error occurred. Please try refreshing the page.';
  }
}
