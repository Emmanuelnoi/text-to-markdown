import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPlausible: jasmine.Spy;

  describe('Browser environment', () => {
    beforeEach(() => {
      // Mock Plausible function
      mockPlausible = jasmine.createSpy('plausible');
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
      it('should call plausible with event name only', () => {
        service.trackEvent('TestEvent');

        expect(mockPlausible).toHaveBeenCalledWith('TestEvent', undefined);
      });

      it('should call plausible with event name and properties', () => {
        const properties = { format: 'markdown', method: 'copy' };
        service.trackEvent('Export', properties);

        expect(mockPlausible).toHaveBeenCalledWith('Export', { props: properties });
      });

      it('should handle numeric properties', () => {
        const properties = { count: 5, size: 1024 };
        service.trackEvent('Upload', properties);

        expect(mockPlausible).toHaveBeenCalledWith('Upload', { props: properties });
      });

      it('should handle mixed property types', () => {
        const properties = { format: 'pdf', size: 2048, success: 'true' };
        service.trackEvent('Download', properties);

        expect(mockPlausible).toHaveBeenCalledWith('Download', { props: properties });
      });

      it('should not throw error when plausible is undefined', () => {
        delete window.plausible;

        expect(() => {
          service.trackEvent('TestEvent');
        }).not.toThrow();
      });

      it('should log to console when plausible is not available', () => {
        delete window.plausible;
        const consoleSpy = spyOn(console, 'log');

        service.trackEvent('TestEvent', { prop: 'value' });

        expect(consoleSpy).toHaveBeenCalledWith(
          '[Analytics] Plausible not loaded yet. Event: TestEvent',
          { prop: 'value' },
        );
      });

      it('should handle errors gracefully', () => {
        mockPlausible.and.throwError('Network error');
        const consoleErrorSpy = spyOn(console, 'error');

        expect(() => {
          service.trackEvent('TestEvent');
        }).not.toThrow();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[Analytics] Failed to track event:',
          jasmine.any(Error),
        );
      });
    });

    describe('trackPageView', () => {
      it('should call plausible with pageview event', () => {
        service.trackPageView('/test-page');

        expect(mockPlausible).toHaveBeenCalledWith('pageview', { props: { url: '/test-page' } });
      });

      it('should not throw error when plausible is undefined', () => {
        delete window.plausible;

        expect(() => {
          service.trackPageView('/test-page');
        }).not.toThrow();
      });

      it('should handle errors gracefully', () => {
        mockPlausible.and.throwError('Network error');
        const consoleErrorSpy = spyOn(console, 'error');

        expect(() => {
          service.trackPageView('/test-page');
        }).not.toThrow();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          '[Analytics] Failed to track pageview:',
          jasmine.any(Error),
        );
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
      const mockPlausibleSpy = jasmine.createSpy('plausible');
      window.plausible = mockPlausibleSpy;

      service.trackEvent('TestEvent');

      expect(mockPlausibleSpy).not.toHaveBeenCalled();

      delete window.plausible;
    });

    it('should not track page views on server side', () => {
      const mockPlausibleSpy = jasmine.createSpy('plausible');
      window.plausible = mockPlausibleSpy;

      service.trackPageView('/test-page');

      expect(mockPlausibleSpy).not.toHaveBeenCalled();

      delete window.plausible;
    });
  });
});
