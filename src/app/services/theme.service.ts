import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from './analytics.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private analytics = inject(AnalyticsService);
  private readonly THEME_KEY = 'markdown-converter-theme';

  isDarkMode = signal(false);

  constructor() {
    this.initializeTheme();

    effect(() => {
      this.updateDOM(this.isDarkMode());
    });
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedTheme = localStorage.getItem(this.THEME_KEY);

    if (storedTheme) {
      this.isDarkMode.set(storedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
  }

  private updateDOM(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
    this.analytics.trackEvent('Theme Changed', { theme: this.isDarkMode() ? 'dark' : 'light' });
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.isDarkMode() ? 'dark' : 'light';
  }
}
