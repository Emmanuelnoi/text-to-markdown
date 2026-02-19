import { TestBed } from '@angular/core/testing';
import { EditorService } from './editor.service';
import { AlertService } from './alert.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as retryModule from '../utils/retry';

describe('EditorService', () => {
  let service: EditorService;
  let alertServiceSpy: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    alertServiceSpy = { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() };

    TestBed.configureTestingModule({
      providers: [EditorService, { provide: AlertService, useValue: alertServiceSpy }],
    });

    service = TestBed.inject(EditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial empty content', () => {
    expect(service.content()).toBe('');
  });

  it('should have initial empty markdown content', () => {
    expect(service.markdownContent()).toBe('');
  });

  it('should have null editor in test environment', () => {
    expect(service.editor()).toBeNull();
  });

  describe('updateContent', () => {
    it('should update content signal directly', () => {
      const newContent = '<p>Updated</p>';
      service.updateContent(newContent);
      expect(service.content()).toBe(newContent);
    });

    it('should handle empty content', () => {
      service.updateContent('');
      expect(service.content()).toBe('');
    });
  });

  describe('getContent', () => {
    it('should return current content from signal', () => {
      service.content.set('<p>Hello</p>');
      expect(service.getContent()).toBe('<p>Hello</p>');
    });
  });

  describe('getMarkdown', () => {
    it('should return markdown content from signal', () => {
      service.markdownContent.set('# Test');
      expect(service.getMarkdown()).toBe('# Test');
    });
  });

  describe('getEditor', () => {
    it('should return null in test environment', () => {
      const editor = service.getEditor();
      expect(editor).toBeNull();
    });
  });

  describe('setContent', () => {
    it('should not throw when editor is null', () => {
      expect(() => service.setContent('<p>Test</p>')).not.toThrow();
    });
  });

  describe('clearContent', () => {
    it('should not throw when editor is null', () => {
      expect(() => service.clearContent()).not.toThrow();
    });
  });

  describe('destroyEditor', () => {
    it('should not throw when editor is null', () => {
      expect(() => service.destroyEditor()).not.toThrow();
      expect(service.editor()).toBeNull();
    });
  });

  describe('convertToMarkdown', () => {
    it('should convert HTML to markdown', async () => {
      service.content.set('<p>Test paragraph</p>');
      await service.convertToMarkdown();
      expect(service.markdownContent()).toBeTruthy();
      expect(service.markdownContent()).toContain('Test paragraph');
    });

    it('should handle empty content', async () => {
      service.content.set('');
      await service.convertToMarkdown();
      expect(service.markdownContent()).toBe('');
    });

    it('should handle whitespace-only content', async () => {
      service.content.set('   ');
      await service.convertToMarkdown();
      expect(service.markdownContent()).toBe('');
    });

    it('should convert headings correctly', async () => {
      service.content.set('<h1>Title</h1>');
      await service.convertToMarkdown();
      expect(service.markdownContent()).toContain('Title');
    });

    it('should convert bold text correctly', async () => {
      service.content.set('<strong>Bold text</strong>');
      await service.convertToMarkdown();
      expect(service.markdownContent()).toContain('**Bold text**');
    });
  });

  describe('convertAndCopyMarkdown', () => {
    it('should show info alert when no content', async () => {
      service.content.set('');
      await service.convertAndCopyMarkdown();
      expect(alertServiceSpy.info).toHaveBeenCalledWith(
        'No Content',
        'No content to copy. Please enter some text first.',
      );
    });

    it('should show info alert when whitespace-only content', async () => {
      service.content.set('   ');
      await service.convertAndCopyMarkdown();
      expect(alertServiceSpy.info).toHaveBeenCalledWith(
        'No Content',
        'No content to copy. Please enter some text first.',
      );
    });

    it('should convert and copy markdown when content exists', async () => {
      service.content.set('<p>Test</p>');

      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

      await service.convertAndCopyMarkdown();

      expect(service.markdownContent()).toBeTruthy();
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  describe('convertAndDownloadMarkdown', () => {
    it('should show info alert when no content', async () => {
      service.content.set('');
      await service.convertAndDownloadMarkdown();
      expect(alertServiceSpy.info).toHaveBeenCalledWith(
        'No Content',
        'No content to download. Please enter some text first.',
      );
    });

    it('should download markdown file when content exists', async () => {
      service.content.set('<p>Test</p>');

      const createObjectURLMock = vi.fn().mockReturnValue('blob:test');
      const revokeObjectURLMock = vi.fn();
      const clickMock = vi.fn();
      const createElementMock = vi
        .fn()
        .mockReturnValue({ click: clickMock, href: '', download: '' });

      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;
      vi.spyOn(document, 'createElement').mockImplementation(createElementMock);

      await service.convertAndDownloadMarkdown();

      expect(alertServiceSpy.success).toHaveBeenCalledWith(
        'Download Complete',
        'Markdown converted and downloaded successfully!',
      );
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
    });
  });

  describe('importMarkdownFromText', () => {
    it('should set markdown content', async () => {
      const markdown = '# Hello World';
      await service.importMarkdownFromText(markdown);
      expect(service.markdownContent()).toBe(markdown);
    });

    it('should handle empty markdown', async () => {
      await service.importMarkdownFromText('');
      expect(service.markdownContent()).toBe('');
    });
  });

  describe('importMarkdownFromFile', () => {
    it('should import valid markdown file', async () => {
      const file = new File(['# Test'], 'test.md', { type: 'text/markdown' });
      await service.importMarkdownFromFile(file);
      expect(alertServiceSpy.success).toHaveBeenCalledWith(
        'Import Complete',
        'Successfully imported test.md',
      );
    });

    it('should accept .markdown extension', async () => {
      const file = new File(['# Test'], 'test.markdown', { type: 'text/markdown' });
      await service.importMarkdownFromFile(file);
      expect(alertServiceSpy.success).toHaveBeenCalledWith(
        'Import Complete',
        'Successfully imported test.markdown',
      );
    });

    it('should reject invalid file type', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await expect(service.importMarkdownFromFile(file)).rejects.toThrow('Invalid file type');
      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        'Invalid File',
        'Please select a valid markdown file (.md or .markdown)',
      );
    });
  });

  describe('importFromUrl', () => {
    it('should import markdown from URL', async () => {
      vi.spyOn(retryModule, 'fetchWithRetry').mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('# Markdown from URL'),
      } as Response);

      await service.importFromUrl('https://example.com/test.md');
      expect(alertServiceSpy.success).toHaveBeenCalledWith(
        'Import Complete',
        'Successfully imported from URL',
      );
    });

    it('should handle 404 errors with specific message', async () => {
      vi.spyOn(retryModule, 'fetchWithRetry').mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await service.importFromUrl('https://example.com/invalid.md');
      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        'Import Failed',
        'URL not found. Please check the URL and try again.',
      );
    });

    it('should handle network errors with specific message', async () => {
      vi.spyOn(retryModule, 'fetchWithRetry').mockRejectedValue(new TypeError('Failed to fetch'));

      await service.importFromUrl('https://example.com/error.md');
      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        'Import Failed',
        'Network error. Please check your internet connection and try again.',
      );
    });

    it('should handle timeout errors', async () => {
      vi.spyOn(retryModule, 'fetchWithRetry').mockRejectedValue(new Error('Request timeout'));

      await service.importFromUrl('https://example.com/slow.md');
      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        'Import Failed',
        'Request timed out. The server may be slow or unreachable.',
      );
    });

    it('should handle 403 forbidden errors', async () => {
      vi.spyOn(retryModule, 'fetchWithRetry').mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      await service.importFromUrl('https://example.com/forbidden.md');
      expect(alertServiceSpy.error).toHaveBeenCalledWith(
        'Import Failed',
        'Access denied. You may not have permission to access this URL.',
      );
    });
  });

  describe('alert methods', () => {
    it('should show success alert', () => {
      service.showSuccessAlert();
      expect(alertServiceSpy.success).toHaveBeenCalledWith(
        'Success',
        'Operation completed successfully!',
      );
    });

    it('should show error alert', () => {
      service.showErrorAlert();
      expect(alertServiceSpy.error).toHaveBeenCalledWith('Error', 'Something went wrong!');
    });

    it('should show info alert', () => {
      service.showInfoAlert();
      expect(alertServiceSpy.info).toHaveBeenCalledWith(
        'No Content',
        'No content to convert to Markdown.',
      );
    });
  });
});
