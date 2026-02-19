import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsEventName, AnalyticsEventProperties } from './analytics.models';

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props: Record<string, string> }) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  trackEvent<TEvent extends AnalyticsEventName>(
    eventName: TEvent,
    properties?: AnalyticsEventProperties<TEvent>,
  ): void {
    if (this.shouldSkipTracking()) return;

    try {
      if (window.plausible) {
        window.plausible(
          eventName,
          properties
            ? { props: this.toPlausibleProps(properties as Record<string, string | undefined>) }
            : undefined,
        );
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  trackPageView(url: string): void {
    if (this.shouldSkipTracking()) return;

    try {
      if (window.plausible) {
        window.plausible('pageview', { props: { url } });
      }
    } catch (error) {
      console.error('[Analytics] Failed to track pageview:', error);
    }
  }

  private shouldSkipTracking(): boolean {
    if (!this.isBrowser || typeof window === 'undefined') {
      return true;
    }

    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  private toPlausibleProps(properties: Record<string, string | undefined>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(properties).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
  }
}
