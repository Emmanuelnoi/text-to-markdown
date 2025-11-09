import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';
import { vi } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      // no-op
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi
        .fn()
        .mockReturnValue({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }),
    });

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.isDarkMode.set(false);
      service.toggleTheme();
      expect(service.isDarkMode()).toBe(true);
    });

    it('should toggle from dark to light', () => {
      service.isDarkMode.set(true);
      service.toggleTheme();
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should set dark theme', () => {
      service.setTheme(true);
      expect(service.isDarkMode()).toBe(true);
    });

    it('should set light theme', () => {
      service.setTheme(false);
      expect(service.isDarkMode()).toBe(false);
    });
  });

  describe('getCurrentTheme', () => {
    it('should return "dark" when in dark mode', () => {
      service.isDarkMode.set(true);
      expect(service.getCurrentTheme()).toBe('dark');
    });

    it('should return "light" when in light mode', () => {
      service.isDarkMode.set(false);
      expect(service.getCurrentTheme()).toBe('light');
    });
  });
});
