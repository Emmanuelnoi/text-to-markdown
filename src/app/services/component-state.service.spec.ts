import { TestBed } from '@angular/core/testing';
import { ComponentStateService } from './component-state.service';

describe('ComponentStateService', () => {
  let service: ComponentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with visibility false', () => {
    const visibility = service.getComponentVisibility();
    expect(visibility()).toBe(false);
  });

  describe('getComponentVisibility', () => {
    it('should return the visibility signal', () => {
      const visibility = service.getComponentVisibility();
      expect(visibility).toBeDefined();
      expect(typeof visibility()).toBe('boolean');
    });

    it('should return a writable signal', () => {
      const visibility = service.getComponentVisibility();
      expect(visibility.set).toBeDefined();
      expect(visibility.update).toBeDefined();
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle visibility from false to true', () => {
      const visibility = service.getComponentVisibility();
      expect(visibility()).toBe(false);

      service.toggleVisibility();
      expect(visibility()).toBe(true);
    });

    it('should toggle visibility from true to false', () => {
      const visibility = service.getComponentVisibility();
      visibility.set(true);

      service.toggleVisibility();
      expect(visibility()).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      const visibility = service.getComponentVisibility();
      expect(visibility()).toBe(false);

      service.toggleVisibility();
      expect(visibility()).toBe(true);

      service.toggleVisibility();
      expect(visibility()).toBe(false);

      service.toggleVisibility();
      expect(visibility()).toBe(true);
    });
  });

  describe('signal reactivity', () => {
    it('should allow manual updates to the signal', () => {
      const visibility = service.getComponentVisibility();

      visibility.set(true);
      expect(visibility()).toBe(true);

      visibility.set(false);
      expect(visibility()).toBe(false);
    });

    it('should preserve state across multiple accesses', () => {
      service.toggleVisibility();
      const visibility1 = service.getComponentVisibility();
      const visibility2 = service.getComponentVisibility();

      expect(visibility1()).toBe(visibility2());
      expect(visibility1()).toBe(true);
    });
  });
});
