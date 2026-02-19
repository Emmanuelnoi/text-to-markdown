import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { vi } from 'vitest';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPlausible: ReturnType<typeof vi.fn>;

  describe('Browser environment', () => {
    beforeEach(() => {
      mockPlausible = vi.fn();
      window.plausible = mockPlausible;

      TestBed.configureTestingModule({
        providers: [AnalyticsService, { provide: PLATFORM_ID, useValue: 'browser' }],
      });

      service = TestBed.inject(AnalyticsService);
    });

    afterEach(() => {
      delete window.plausible;
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('trackEvent', () => {
      it('should not throw error in any circumstances', () => {
        expect(() => {
          service.trackEvent('Export', { format: 'markdown', method: 'copy' });
        }).not.toThrow();

        expect(() => {
          service.trackEvent('Import', { method: 'file', fileType: 'text/markdown' });
        }).not.toThrow();
      });
    });

    describe('trackPageView', () => {
      it('should not throw error in any circumstances', () => {
        expect(() => {
          service.trackPageView('/test-page');
        }).not.toThrow();
      });
    });
  });

  describe('Server environment (SSR)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [AnalyticsService, { provide: PLATFORM_ID, useValue: 'server' }],
      });

      service = TestBed.inject(AnalyticsService);
    });

    it('should not track events on server side', () => {
      const mockPlausibleSpy = vi.fn();
      window.plausible = mockPlausibleSpy;

      service.trackEvent('Export', { format: 'markdown', method: 'download' });

      expect(mockPlausibleSpy).not.toHaveBeenCalled();

      delete window.plausible;
    });

    it('should not track page views on server side', () => {
      const mockPlausibleSpy = vi.fn();
      window.plausible = mockPlausibleSpy;

      service.trackPageView('/test-page');

      expect(mockPlausibleSpy).not.toHaveBeenCalled();

      delete window.plausible;
    });
  });
});
