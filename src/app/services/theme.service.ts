import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private readonly THEME_KEY = 'markdown-converter-theme';

  // Signal to track dark mode state
  isDarkMode = signal(false);

  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();

    // Effect to update DOM when theme changes
    effect(() => {
      this.updateDOM(this.isDarkMode());
    });
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check localStorage first
    const storedTheme = localStorage.getItem(this.THEME_KEY);

    if (storedTheme) {
      this.isDarkMode.set(storedTheme === 'dark');
    } else {
      // Check system preference
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

    // Save preference to localStorage
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.isDarkMode() ? 'dark' : 'light';
  }
}
