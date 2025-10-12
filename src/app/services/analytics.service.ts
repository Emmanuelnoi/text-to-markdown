import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Extend Window interface to include Plausible function
 */
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props: Record<string, string | number> }) => void;
  }
}

/**
 * Analytics service for tracking user events using Plausible Analytics
 * Plausible is privacy-friendly and doesn't use cookies
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Track a custom event
   * @param eventName The name of the event (e.g., 'Export', 'Import')
   * @param properties Optional properties to attach to the event
   * @example
   * trackEvent('Export', { format: 'markdown', method: 'copy' })
   */
  trackEvent(eventName: string, properties?: Record<string, string | number>): void {
    if (!this.isBrowser) {
      return; // Don't track on server-side rendering
    }

    // Skip tracking on localhost to avoid console noise
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(eventName, properties ? { props: properties } : undefined);
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  /**
   * Track page view (automatic with Plausible, but can be called manually for SPA route changes)
   * @param url The URL path to track
   */
  trackPageView(url: string): void {
    if (!this.isBrowser) {
      return;
    }

    // Skip tracking on localhost to avoid console noise
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('pageview', { props: { url } });
      }
    } catch (error) {
      console.error('[Analytics] Failed to track pageview:', error);
    }
  }
}
