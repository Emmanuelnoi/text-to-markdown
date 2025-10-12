import { TestBed } from '@angular/core/testing';
import { EditorService } from './editor.service';
import { AlertService } from './alert.service';

describe('EditorService', () => {
  let service: EditorService;
  let alertService: jasmine.SpyObj<AlertService>;

  beforeEach(() => {
    const alertServiceSpy = jasmine.createSpyObj('AlertService', [
      'success',
      'error',
      'info',
      'warning',
    ]);

    TestBed.configureTestingModule({
      providers: [EditorService, { provide: AlertService, useValue: alertServiceSpy }],
    });

    service = TestBed.inject(EditorService);
    alertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize editor asynchronously', done => {
    // Wait for async initialization
    setTimeout(() => {
      expect(service.editor()).toBeTruthy();
      expect(service.editor()?.isDestroyed).toBe(false);
      done();
    }, 100);
  });

  it('should have initial empty content', () => {
    expect(service.content()).toBe('');
  });

  it('should have initial empty markdown content', () => {
    expect(service.markdownContent()).toBe('');
  });

  describe('setContent', () => {
    it('should set editor content', done => {
      setTimeout(() => {
        const testContent = '<p>Test content</p>';
        service.setContent(testContent);
        expect(service.content()).toContain('Test content');
        done();
      }, 100);
    });

    it('should handle empty content', done => {
      setTimeout(() => {
        service.setContent('');
        expect(service.content()).toBe('');
        done();
      }, 100);
    });
  });

  describe('getContent', () => {
    it('should return current content', done => {
      setTimeout(() => {
        service.setContent('<p>Hello</p>');
        expect(service.getContent()).toContain('Hello');
        done();
      }, 100);
    });
  });

  describe('clearContent', () => {
    it('should clear editor content', done => {
      setTimeout(() => {
        service.setContent('<p>Test</p>');
        service.clearContent();
        expect(service.content()).toBe('');
        done();
      }, 100);
    });
  });

  describe('updateContent', () => {
    it('should update content signal', () => {
      const newContent = '<p>Updated</p>';
      service.updateContent(newContent);
      expect(service.content()).toBe(newContent);
    });
  });

  describe('getEditor', () => {
    it('should return editor instance', done => {
      setTimeout(() => {
        const editor = service.getEditor();
        expect(editor).toBeTruthy();
        done();
      }, 100);
    });
  });

  describe('getMarkdown', () => {
    it('should return markdown content', () => {
      service.markdownContent.set('# Test');
      expect(service.getMarkdown()).toBe('# Test');
    });
  });

  describe('convertToMarkdown', () => {
    it('should convert HTML to markdown', async () => {
      service.content.set('<p>Test</p>');
      await service.convertToMarkdown();
      expect(service.markdownContent()).toBeTruthy();
    });

    it('should handle empty content', async () => {
      service.content.set('');
      await service.convertToMarkdown();
      expect(service.markdownContent()).toBe('');
    });
  });

  describe('convertAndCopyMarkdown', () => {
    it('should show info alert when no content', async () => {
      service.content.set('');
      await service.convertAndCopyMarkdown();
      expect(alertService.info).toHaveBeenCalledWith(
        'No Content',
        'No content to copy. Please enter some text first.',
      );
    });
  });

  describe('convertAndDownloadMarkdown', () => {
    beforeEach(() => {
      // Mock URL and createElement
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');
    });

    it('should show info alert when no content', async () => {
      service.content.set('');
      await service.convertAndDownloadMarkdown();
      expect(alertService.info).toHaveBeenCalledWith(
        'No Content',
        'No content to download. Please enter some text first.',
      );
    });

    it('should download markdown file', async () => {
      service.content.set('<p>Test</p>');
      await service.convertAndDownloadMarkdown();
      expect(alertService.success).toHaveBeenCalled();
    });
  });

  describe('importMarkdownFromText', () => {
    it('should import markdown and convert to HTML', done => {
      setTimeout(async () => {
        const markdown = '# Hello World';
        await service.importMarkdownFromText(markdown);
        expect(service.markdownContent()).toBe(markdown);
        expect(service.content()).toContain('Hello World');
        done();
      }, 200);
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
      expect(alertService.success).toHaveBeenCalledWith(
        'Import Complete',
        'Successfully imported test.md',
      );
    });

    it('should reject invalid file type', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      try {
        await service.importMarkdownFromFile(file);
        fail('Should have rejected');
      } catch {
        expect(alertService.error).toHaveBeenCalledWith(
          'Invalid File',
          'Please select a valid markdown file (.md or .markdown)',
        );
      }
    });
  });

  describe('importFromUrl', () => {
    beforeEach(() => {
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Markdown from URL'),
        } as Response),
      );
    });

    it('should import markdown from URL', async () => {
      await service.importFromUrl('https://example.com/test.md');
      expect(alertService.success).toHaveBeenCalledWith(
        'Import Complete',
        'Successfully imported from URL',
      );
    });

    it('should handle fetch errors', async () => {
      (window.fetch as jasmine.Spy).and.returnValue(
        Promise.resolve({ ok: false, status: 404 } as Response),
      );
      await service.importFromUrl('https://example.com/invalid.md');
      expect(alertService.error).toHaveBeenCalledWith('Import Failed', 'Failed to import from URL');
    });
  });

  describe('destroyEditor', () => {
    it('should destroy editor instance', done => {
      setTimeout(() => {
        service.destroyEditor();
        expect(service.editor()).toBeNull();
        done();
      }, 100);
    });
  });

  describe('alert methods', () => {
    it('should show success alert', () => {
      service.showSuccessAlert();
      expect(alertService.success).toHaveBeenCalledWith(
        'Success',
        'Operation completed successfully!',
      );
    });

    it('should show error alert', () => {
      service.showErrorAlert();
      expect(alertService.error).toHaveBeenCalledWith('Error', 'Something went wrong!');
    });

    it('should show info alert', () => {
      service.showInfoAlert();
      expect(alertService.info).toHaveBeenCalledWith(
        'No Content',
        'No content to convert to Markdown.',
      );
    });
  });
});
