import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ImportModalComponent } from './import-modal.component';
import { EditorService } from '../services/editor.service';

describe('ImportModalComponent', () => {
  let component: ImportModalComponent;
  let fixture: ComponentFixture<ImportModalComponent>;
  let editorService: jasmine.SpyObj<EditorService>;

  beforeEach(async () => {
    const editorServiceSpy = jasmine.createSpyObj('EditorService', [
      'importMarkdownFromFile',
      'importFromUrl',
      'importMarkdownFromText',
    ]);

    await TestBed.configureTestingModule({
      imports: [FormsModule, ImportModalComponent],
      providers: [{ provide: EditorService, useValue: editorServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportModalComponent);
    component = fixture.componentInstance;
    editorService = TestBed.inject(EditorService) as jasmine.SpyObj<EditorService>;
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
      spyOn(component.closeModal, 'emit');
      component.close();
      expect(component.closeModal.emit).toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    it('should set isDragOver to true on dragOver', () => {
      const event = new DragEvent('dragover');
      spyOn(event, 'preventDefault');
      component.onDragOver(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver).toBe(true);
    });

    it('should set isDragOver to false on dragLeave', () => {
      const event = new DragEvent('dragleave');
      spyOn(event, 'preventDefault');
      component.isDragOver = true;
      component.onDragLeave(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver).toBe(false);
    });

    it('should handle file drop', () => {
      const file = new File(['# Test'], 'test.md', { type: 'text/markdown' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const event = new DragEvent('drop', { dataTransfer });
      spyOn(event, 'preventDefault');
      editorService.importMarkdownFromFile.and.returnValue(Promise.resolve());

      component.onDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.isDragOver).toBe(false);
    });

    it('should ignore drop without files', () => {
      const event = new DragEvent('drop');
      spyOn(event, 'preventDefault');
      component.onDrop(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(editorService.importMarkdownFromFile).not.toHaveBeenCalled();
    });
  });

  describe('file selection', () => {
    it('should handle file selection from input', () => {
      const file = new File(['# Test'], 'test.md', { type: 'text/markdown' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const event = { target: { files: dataTransfer.files } } as unknown as Event;

      editorService.importMarkdownFromFile.and.returnValue(Promise.resolve());
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
      editorService.importFromUrl.and.returnValue(Promise.resolve());
      spyOn(component, 'close');

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
      editorService.importFromUrl.and.returnValue(Promise.reject('error'));

      await component.importFromUrl();
      expect(component.isImporting).toBe(false);
    });

    it('should set isImporting flag during import', async () => {
      component.importUrl = 'https://example.com/test.md';
      let resolveFn: () => void;
      const promise = new Promise<void>(resolve => {
        resolveFn = resolve;
      });
      editorService.importFromUrl.and.returnValue(promise);

      const importPromise = component.importFromUrl();
      expect(component.isImporting).toBe(true);

      resolveFn!();
      await importPromise;
      expect(component.isImporting).toBe(false);
    });
  });

  describe('loadTemplate', () => {
    it('should load readme template', async () => {
      editorService.importMarkdownFromText.and.returnValue(Promise.resolve());
      spyOn(component, 'close');

      await component.loadTemplate('readme');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        jasmine.stringContaining('# Project Name'),
      );
      expect(component.close).toHaveBeenCalled();
    });

    it('should load blog template', async () => {
      editorService.importMarkdownFromText.and.returnValue(Promise.resolve());
      spyOn(component, 'close');

      await component.loadTemplate('blog');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        jasmine.stringContaining('# Blog Post Title'),
      );
      expect(component.close).toHaveBeenCalled();
    });

    it('should load meeting template', async () => {
      editorService.importMarkdownFromText.and.returnValue(Promise.resolve());
      spyOn(component, 'close');

      await component.loadTemplate('meeting');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        jasmine.stringContaining('# Meeting Notes'),
      );
      expect(component.close).toHaveBeenCalled();
    });

    it('should load docs template', async () => {
      editorService.importMarkdownFromText.and.returnValue(Promise.resolve());
      spyOn(component, 'close');

      await component.loadTemplate('docs');

      expect(editorService.importMarkdownFromText).toHaveBeenCalledWith(
        jasmine.stringContaining('# Documentation Title'),
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
