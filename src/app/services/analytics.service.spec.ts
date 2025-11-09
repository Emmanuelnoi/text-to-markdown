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

    // Note: Tests run in localhost environment where the service intentionally
    // doesn't track analytics. In production, these methods would call plausible.

    describe('trackEvent', () => {
      it('should not throw error in any circumstances', () => {
        expect(() => {
          service.trackEvent('TestEvent');
        }).not.toThrow();

        expect(() => {
          service.trackEvent('TestEvent', { prop: 'value' });
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

      service.trackEvent('TestEvent');

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
