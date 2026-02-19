import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Editor } from '@tiptap/core';
import { AlertService } from './alert.service';
import { AnalyticsService } from './analytics.service';
import { fetchWithRetry } from '../utils/retry';

@Injectable({ providedIn: 'root' })
export class EditorService {
  editor = signal<Editor | null>(null);
  readonly content: WritableSignal<string> = signal('');
  readonly markdownContent: WritableSignal<string> = signal('');

  private turndownService: { turndown: (html: string) => string } | null = null;
  private alertService = inject(AlertService);
  private analytics = inject(AnalyticsService);

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(globalThis as any).VITEST_ENVIRONMENT) {
      this.initializeEditor();
    }
  }

  private async initializeEditor() {
    const [
      { default: StarterKit },
      { default: Placeholder },
      { default: TiptapUnderline },
      { default: TiptapHeading },
      { default: Link },
      { default: CodeBlockLowlight },
    ] = await Promise.all([
      import('@tiptap/starter-kit'),
      import('@tiptap/extension-placeholder'),
      import('@tiptap/extension-underline'),
      import('@tiptap/extension-heading'),
      import('@tiptap/extension-link'),
      import('@tiptap/extension-code-block'),
    ]);

    const tiptapEditor = new Editor({
      extensions: [
        StarterKit.configure({ heading: false, codeBlock: false }),
        Placeholder.configure({ placeholder: 'Start writing your markdown-friendly rich text...' }),
        TiptapUnderline,
        Link,
        CodeBlockLowlight,
        TiptapHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      ],
      editorProps: {
        attributes: {
          'aria-label': 'Rich text editor - Enter your content here',
          role: 'textbox',
          'aria-multiline': 'true',
        },
      },
      onUpdate: ({ editor }) => {
        this.content.set(editor.getHTML());
      },
    });

    this.editor.set(tiptapEditor);
  }

  getEditor(): Editor | null {
    return this.editor();
  }

  setContent(content: string) {
    const instance = this.editor();
    if (!instance) return;

    instance.commands.setContent(content);
    this.content.set(content);
  }

  getContent(): string {
    return this.content();
  }

  clearContent() {
    const instance = this.editor();
    if (!instance) return;

    instance.commands.clearContent();
    instance.commands.focus();
    this.content.set('');
  }

  destroyEditor() {
    const instance = this.editor();
    if (!instance) return;

    instance.destroy();
    this.editor.set(null);
  }

  async convertToMarkdown(): Promise<void> {
    const markdown = await this.convertCurrentContentToMarkdown();
    if (markdown === null) return;

    this.markdownContent.set(markdown);
  }

  updateContent(newContent: string): void {
    this.content.set(newContent);
  }

  async convertAndCopyMarkdown(): Promise<void> {
    const markdown = await this.convertCurrentContentToMarkdown();
    if (markdown === null) {
      this.markdownContent.set('');
      this.alertService.info('No Content', 'No content to copy. Please enter some text first.');
      return;
    }

    this.markdownContent.set(markdown);

    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        this.alertService.success('Success', 'Markdown converted and copied to clipboard! ✅');
        this.analytics.trackEvent('Export', { format: 'markdown', method: 'copy' });
      })
      .catch(err => {
        console.error('Clipboard error:', err);
        this.alertService.error('Copy Failed', 'Failed to copy Markdown');
      });
  }

  async convertAndDownloadMarkdown(): Promise<void> {
    const markdown = await this.convertCurrentContentToMarkdown();
    if (markdown === null) {
      this.markdownContent.set('');
      this.alertService.info('No Content', 'No content to download. Please enter some text first.');
      return;
    }

    this.markdownContent.set(markdown);

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
    a.click();
    URL.revokeObjectURL(url);

    this.alertService.success(
      'Download Complete',
      'Markdown converted and downloaded successfully!',
    );
    this.analytics.trackEvent('Export', { format: 'markdown', method: 'download' });
  }

  getMarkdown(): string {
    return this.markdownContent();
  }

  showSuccessAlert() {
    this.alertService.success('Success', 'Operation completed successfully!');
  }

  showErrorAlert() {
    this.alertService.error('Error', 'Something went wrong!');
  }

  showInfoAlert() {
    this.alertService.info('No Content', 'No content to convert to Markdown.');
  }

  importMarkdownFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (
        !file.name.toLowerCase().endsWith('.md') &&
        !file.name.toLowerCase().endsWith('.markdown')
      ) {
        this.alertService.error(
          'Invalid File',
          'Please select a valid markdown file (.md or .markdown)',
        );
        reject(new Error('Invalid file type'));
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const markdownText = e.target?.result as string;
          this.importMarkdownFromText(markdownText);
          this.alertService.success('Import Complete', `Successfully imported ${file.name}`);
          this.analytics.trackEvent('Import', {
            method: 'file',
            fileType: file.type || 'text/markdown',
          });
          resolve();
        } catch (error) {
          this.alertService.error('Import Failed', 'Failed to import markdown file');
          reject(error);
        }
      };
      reader.onerror = () => {
        this.alertService.error('Read Error', 'Failed to read file');
        reject(new Error('File read error'));
      };
      reader.readAsText(file);
    });
  }

  async importMarkdownFromText(markdownText: string): Promise<void> {
    try {
      const { marked } = await import('marked');
      const html = marked(markdownText) as string;
      this.setContent(html);
      this.markdownContent.set(markdownText);
    } catch (error) {
      console.error('Failed to import markdown:', error);
      this.alertService.error('Parse Error', 'Failed to parse markdown content');
    }
  }

  async importFromUrl(url: string): Promise<void> {
    let retryCount = 0;

    try {
      const response = await fetchWithRetry(
        url,
        {},
        {
          maxRetries: 3,
          initialDelay: 1000,
          onRetry: (attempt, error, nextDelay) => {
            retryCount = attempt;
            console.warn(`Retry attempt ${attempt} for URL import: ${error.message}`);
            this.alertService.warning(
              'Retrying...',
              `Connection failed. Retrying (${attempt}/3)...`,
              true,
              nextDelay + 500,
            );
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdownText = await response.text();
      await this.importMarkdownFromText(markdownText);

      const message =
        retryCount > 0
          ? `Successfully imported from URL (after ${retryCount} ${retryCount === 1 ? 'retry' : 'retries'})`
          : 'Successfully imported from URL';

      this.alertService.success('Import Complete', message);
      this.analytics.trackEvent('Import', { method: 'url', retries: String(retryCount) });
    } catch (error) {
      console.error('Failed to import from URL:', error);

      const errorMessage = this.getUrlImportErrorMessage(error);
      this.alertService.error('Import Failed', errorMessage);
    }
  }

  private getUrlImportErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Failed to import from URL. Please try again.';
    }

    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || error.name === 'TypeError') {
      return 'Network error. Please check your internet connection and try again.';
    }

    if (message.includes('timeout')) {
      return 'Request timed out. The server may be slow or unreachable.';
    }

    if (message.includes('404') || message.includes('not found')) {
      return 'URL not found. Please check the URL and try again.';
    }

    if (message.includes('403') || message.includes('forbidden')) {
      return 'Access denied. You may not have permission to access this URL.';
    }

    if (message.includes('cors')) {
      return 'Cross-origin request blocked. The server does not allow external access.';
    }

    if (message.includes('5')) {
      return 'Server error. Please try again later.';
    }

    return 'Failed to import from URL. Please check the URL and try again.';
  }

  private async convertCurrentContentToMarkdown(): Promise<string | null> {
    const html = this.content();
    if (!html.trim()) {
      return null;
    }

    const converter = await this.getTurndownService();
    return converter.turndown(html);
  }

  private async getTurndownService(): Promise<{ turndown: (html: string) => string }> {
    if (!this.turndownService) {
      const { default: TurndownService } = await import('turndown');
      this.turndownService = new TurndownService();
    }

    return this.turndownService;
  }
}
