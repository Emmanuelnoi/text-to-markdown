import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ImportModalComponent } from './import-modal.component';
import { EditorService } from '../services/editor.service';
import { vi } from 'vitest';

describe('ImportModalComponent', () => {
  let component: ImportModalComponent;
  let fixture: ComponentFixture<ImportModalComponent>;
  let editorService: {
    importMarkdownFromFile: ReturnType<typeof vi.fn>;
    importFromUrl: ReturnType<typeof vi.fn>;
    importMarkdownFromText: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    editorService = {
      importMarkdownFromFile: vi.fn(),
      importFromUrl: vi.fn(),
      importMarkdownFromText: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ImportModalComponent],
      providers: [{ provide: EditorService, useValue: editorService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isOpen false', () => {
    expect(component.isOpen).toBe(false);
  });

  it('should initialize with empty importUrl', () => {
    expect(component.importUrl).toBe('');
  });

  it('should initialize with isImporting false', () => {
    expect(component.isImporting).toBe(false);
  });

  it('should initialize with isDragOver false', () => {
    expect(component.isDragOver).toBe(false);
  });

  describe('close', () => {
    it('should emit closeModal event', () => {
      vi.spyOn(component.closeModal, 'emit');
      component.close();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    it('should set isDragOver to true on dragOver', () => {
      const event = new DragEvent('dragover');
      vi.spyOn(event, 'preventDefault');
      component.onDragOver(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver).toBe(true);
    });

    it('should set isDragOver to false on dragLeave', () => {
      const event = new DragEvent('dragleave');
      vi.spyOn(event, 'preventDefault');
      component.isDragOver = true;
      component.onDragLeave(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver).toBe(false);
    });

    it('should handle file drop', () => {
      const file = new File(['# Test'], 'test.md', { type: 'text/markdown' });
      const dataTransfer = new DataTransfer();
      const fileList = [file] as unknown as FileList;
      Object.defineProperty(dataTransfer, 'files', { value: fileList, writable: false });
      const event = new DragEvent('drop', { dataTransfer });
      vi.spyOn(event, 'preventDefault');
      editorService.importMarkdownFromFile.mockResolvedValue(undefined);

      component.onDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver).toBe(false);
    });

    it('should ignore drop without files', () => {
      const event = new DragEvent('drop');
      vi.spyOn(event, 'preventDefault');
      component.onDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editorService.importMarkdownFromFile).not.toHaveBeenCalled();
    });
  });

  describe('file selection', () => {
    it('should handle file selection from input', () => {
      const file = new File(['# Test'], 'test.md', { type: 'text/markdown' });
      const fileList = [file] as unknown as FileList;
      const event = { target: { files: fileList } } as unknown as Event;

      editorService.importMarkdownFromFile.mockResolvedValue(undefined);
      component.onFileSelected(event);
      expect(editorService.importMarkdownFromFile).toHaveBeenCalledWith(file);
    });

    it('should ignore file selection without files', () => {
      const event = { target: { files: null } } as unknown as Event;

      component.onFileSelected(event);
      expect(editorService.importMarkdownFromFile).not.toHaveBeenCalled();
    });
  });

  describe('importFromUrl', () => {
    it('should import markdown from URL', async () => {
      component.importUrl = 'https://example.com/test.md';
      editorService.importFromUrl.mockResolvedValue(undefined);
      vi.spyOn(component, 'close');

      await component.importFromUrl();

      expect(editorService.importFromUrl).toHaveBeenCalledWith('https://example.com/test.md');
      expect(component.importUrl).toBe('');
      expect(component.close).toHaveBeenCalled();
    });

    it('should not import when URL is empty', async () => {
      component.importUrl = '';
      await component.importFromUrl();
      expect(editorService.importFromUrl).not.toHaveBeenCalled();
    });

    it('should handle import errors', async () => {
      component.importUrl = 'https://example.com/test.md';
      editorService.importFromUrl.mockRejectedValue('error');

      await component.importFromUrl();
      expect(component.isImporting).toBe(false);
    });

    it('should set isImporting flag during import', async () => {
      component.importUrl = 'https://example.com/test.md';
      let resolveFn: () => void;
      const promise = new Promise<void>(resolve => {
        resolveFn = resolve;
      });
      editorService.importFromUrl.mockReturnValue(promise);

      const importPromise = component.importFromUrl();
      expect(component.isImporting).toBe(true);

      resolveFn!();
      await importPromise;
      expect(component.isImporting).toBe(false);
    });
  });

  describe('loadTemplate', () => {
    it('should load readme template', async () => {
      editorService.importMarkdownFromText.mockResolvedValue(undefined);
      vi.spyOn(component, 'close');

      await component.loadTemplate('readme');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        expect.stringContaining('# Project Name'),
      );
      expect(component.close).toHaveBeenCalled();
    });

    it('should load blog template', async () => {
      editorService.importMarkdownFromText.mockResolvedValue(undefined);
      vi.spyOn(component, 'close');

      await component.loadTemplate('blog');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        expect.stringContaining('# Blog Post Title'),
      );
      expect(component.close).toHaveBeenCalled();
    });

    it('should load meeting template', async () => {
      editorService.importMarkdownFromText.mockResolvedValue(undefined);
      vi.spyOn(component, 'close');

      await component.loadTemplate('meeting');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        expect.stringContaining('# Meeting Notes'),
      );
      expect(component.close).toHaveBeenCalled();
    });

    it('should load docs template', async () => {
      editorService.importMarkdownFromText.mockResolvedValue(undefined);
      vi.spyOn(component, 'close');

      await component.loadTemplate('docs');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        expect.stringContaining('# Documentation Title'),
      );
      expect(component.close).toHaveBeenCalled();
    });
  });

  describe('templates', () => {
    it('should have all template types defined', () => {
      expect(component.templates.readme).toBeDefined();
      expect(component.templates.blog).toBeDefined();
      expect(component.templates.meeting).toBeDefined();
      expect(component.templates.docs).toBeDefined();
    });

    it('should have non-empty templates', () => {
      expect(component.templates.readme.length).toBeGreaterThan(0);
      expect(component.templates.blog.length).toBeGreaterThan(0);
      expect(component.templates.meeting.length).toBeGreaterThan(0);
      expect(component.templates.docs.length).toBeGreaterThan(0);
    });
  });
});
