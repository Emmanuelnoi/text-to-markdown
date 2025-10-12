import { TestBed } from '@angular/core/testing';
import { GlobalErrorHandler } from './error-handler.service';
import { AlertService } from './alert.service';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let alertService: jasmine.SpyObj<AlertService>;

  beforeEach(() => {
    const alertServiceSpy = jasmine.createSpyObj('AlertService', [
      'error',
      'info',
      'success',
      'warning',
    ]);

    TestBed.configureTestingModule({
      providers: [GlobalErrorHandler, { provide: AlertService, useValue: alertServiceSpy }],
    });

    errorHandler = TestBed.inject(GlobalErrorHandler);
    alertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
  });

  it('should be created', () => {
    expect(errorHandler).toBeTruthy();
  });

  describe('handleError', () => {
    it('should log error to console', () => {
      const consoleSpy = spyOn(console, 'error');
      const error = new Error('Test error');

      errorHandler.handleError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Global error caught:', error);
    });

    it('should show error alert to user', () => {
      const error = new Error('Test error');

      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        jasmine.any(String),
        true,
        5000,
      );
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return network error message for HTTP errors', () => {
      const error = new Error('HTTP error occurred');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'Network error. Please check your internet connection and try again.',
        true,
        5000,
      );
    });

    it('should return network error message for fetch errors', () => {
      const error = new Error('Failed to fetch');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'Network error. Please check your internet connection and try again.',
        true,
        5000,
      );
    });

    it('should return storage error message for quota errors', () => {
      const error = new Error('Quota exceeded');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'Storage quota exceeded. Please clear some browser data and try again.',
        true,
        5000,
      );
    });

    it('should return storage error message for storage errors', () => {
      const error = new Error('LocalStorage is full');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'Storage quota exceeded. Please clear some browser data and try again.',
        true,
        5000,
      );
    });

    it('should return file error message for file not found errors', () => {
      const error = new Error('File not found');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'File not found. Please select a valid file.',
        true,
        5000,
      );
    });

    it('should return permission error message for permission denied errors', () => {
      const error = new Error('Permission denied');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'Permission denied. Please check your browser settings.',
        true,
        5000,
      );
    });

    it('should return timeout error message for timeout errors', () => {
      const error = new Error('Request timeout');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'Operation timed out. Please try again.',
        true,
        5000,
      );
    });

    it('should return default error message for unknown errors', () => {
      const error = new Error('Some random error');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'An unexpected error occurred. Please try refreshing the page.',
        true,
        5000,
      );
    });

    it('should handle errors without messages', () => {
      const error = new Error();
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'An unexpected error occurred. Please try refreshing the page.',
        true,
        5000,
      );
    });

    it('should handle case insensitive error messages', () => {
      const error = new Error('HTTP ERROR OCCURRED');
      errorHandler.handleError(error);

      expect(alertService.error).toHaveBeenCalledWith(
        'Error Occurred',
        'Network error. Please check your internet connection and try again.',
        true,
        5000,
      );
    });
  });
});
