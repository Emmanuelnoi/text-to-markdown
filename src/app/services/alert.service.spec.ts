import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { vi } from 'vitest';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty alerts initially', () => {
    expect(service.alerts()).toEqual([]);
  });

  describe('show', () => {
    it('should add alert to alerts array', () => {
      service.show('success', 'Test', 'Message', false);
      expect(service.alerts().length).toBe(1);
      expect(service.alerts()[0].type).toBe('success');
      expect(service.alerts()[0].title).toBe('Test');
      expect(service.alerts()[0].message).toBe('Message');
    });

    it('should generate unique IDs', () => {
      const id1 = service.show('success', 'Test 1', 'Message 1', false);
      const id2 = service.show('error', 'Test 2', 'Message 2', false);
      expect(id1).not.toBe(id2);
      expect(service.alerts().length).toBe(2);
    });

    it('should auto-close alert after duration', () => {
      service.show('info', 'Test', 'Message', true, 1000);
      expect(service.alerts().length).toBe(1);
      vi.advanceTimersByTime(1000);
      expect(service.alerts().length).toBe(0);
    });

    it('should not auto-close when autoClose is false', () => {
      service.show('warning', 'Test', 'Message', false, 1000);
      expect(service.alerts().length).toBe(1);
      vi.advanceTimersByTime(1000);
      expect(service.alerts().length).toBe(1);
    });

    it('should use default duration when not specified', () => {
      service.show('success', 'Test', 'Message');
      expect(service.alerts().length).toBe(1);
      vi.advanceTimersByTime(5000); // Default is 5000ms
      expect(service.alerts().length).toBe(0);
    });
  });

  describe('success', () => {
    it('should create success alert', () => {
      service.success('Success Title', 'Success Message', false);
      const alert = service.alerts()[0];
      expect(alert.type).toBe('success');
      expect(alert.title).toBe('Success Title');
      expect(alert.message).toBe('Success Message');
    });

    it('should auto-close by default', () => {
      service.success('Success', 'Message', true, 1000);
      vi.advanceTimersByTime(1000);
      expect(service.alerts().length).toBe(0);
    });
  });

  describe('error', () => {
    it('should create error alert', () => {
      service.error('Error Title', 'Error Message', false);
      const alert = service.alerts()[0];
      expect(alert.type).toBe('error');
      expect(alert.title).toBe('Error Title');
      expect(alert.message).toBe('Error Message');
    });
  });

  describe('warning', () => {
    it('should create warning alert', () => {
      service.warning('Warning Title', 'Warning Message', false);
      const alert = service.alerts()[0];
      expect(alert.type).toBe('warning');
      expect(alert.title).toBe('Warning Title');
      expect(alert.message).toBe('Warning Message');
    });
  });

  describe('info', () => {
    it('should create info alert', () => {
      service.info('Info Title', 'Info Message', false);
      const alert = service.alerts()[0];
      expect(alert.type).toBe('info');
      expect(alert.title).toBe('Info Title');
      expect(alert.message).toBe('Info Message');
    });
  });

  describe('close', () => {
    it('should remove alert by ID', () => {
      const id1 = service.show('success', 'Test 1', 'Message 1', false);
      const id2 = service.show('error', 'Test 2', 'Message 2', false);
      expect(service.alerts().length).toBe(2);

      service.close(id1);
      expect(service.alerts().length).toBe(1);
      expect(service.alerts()[0].id).toBe(id2);
    });

    it('should handle closing non-existent alert', () => {
      service.show('info', 'Test', 'Message', false);
      expect(service.alerts().length).toBe(1);
      service.close(999);
      expect(service.alerts().length).toBe(1);
    });

    it('should handle closing from empty list', () => {
      expect(service.alerts().length).toBe(0);
      service.close(0);
      expect(service.alerts().length).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('should remove all alerts', () => {
      service.success('Test 1', 'Message 1', false);
      service.error('Test 2', 'Message 2', false);
      service.warning('Test 3', 'Message 3', false);
      expect(service.alerts().length).toBe(3);

      service.clearAll();
      expect(service.alerts().length).toBe(0);
    });

    it('should handle clearing empty alert list', () => {
      expect(service.alerts().length).toBe(0);
      service.clearAll();
      expect(service.alerts().length).toBe(0);
    });
  });

  describe('multiple alerts', () => {
    it('should handle multiple alerts with different auto-close times', () => {
      service.show('success', 'Test 1', 'Message 1', true, 1000);
      service.show('error', 'Test 2', 'Message 2', true, 2000);
      service.show('info', 'Test 3', 'Message 3', false);

      expect(service.alerts().length).toBe(3);

      vi.advanceTimersByTime(1000);
      expect(service.alerts().length).toBe(2);

      vi.advanceTimersByTime(1000);
      expect(service.alerts().length).toBe(1);
      expect(service.alerts()[0].type).toBe('info');
    });
  });
});
