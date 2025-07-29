import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapUnderline from '@tiptap/extension-underline';
import TiptapHeading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block';
import StarterKit from '@tiptap/starter-kit';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { AlertService } from './alert.service';

@Injectable({ providedIn: 'root' })
export class EditorService {
  // Signal to track editor content
  editor = signal<Editor | null>(null);
  readonly content: WritableSignal<string> = signal('');
  readonly markdownContent: WritableSignal<string> = signal(''); // store Markdown content

  private turndownService = new TurndownService();
  private alertService = inject(AlertService);

  constructor() {
    this.initializeEditor();
  }

  // Initialize the Tiptap editor
  private initializeEditor() {
    const tiptapEditor = new Editor({
      extensions: [
        StarterKit.configure({
          // Configure StarterKit to exclude extensions we're configuring separately
          heading: false,
          codeBlock: false,
        }),
        Placeholder.configure({ placeholder: 'Start writing your markdown-friendly rich text...' }),
        TiptapUnderline,
        Link,
        CodeBlockLowlight,
        TiptapHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      ],
      onUpdate: ({ editor }) => {
        this.content.set(editor.getHTML()); // Update signal when content changes
      },
    });

    this.editor.set(tiptapEditor); // // Store in signal
  }

  // Get the Tiptap editor instance
  getEditor(): Editor | null {
    return this.editor();
  }

  // Update editor content
  setContent(content: string) {
    const instance = this.editor();
    if (!instance) return;

    instance.commands.setContent(content);
    this.content.set(content);
  }

  // Get editor content
  getContent(): string {
    return this.content(); // or use this.editor()?.getHTML()
  }

  // Clear editor content
  clearContent() {
    const instance = this.editor();
    if (!instance) return;

    instance.commands.clearContent();
    instance.commands.focus(); // Focus the editor after clearing
    this.content.set('');
  }

  // Destroy editor when component is destroyed
  destroyEditor() {
    const instance = this.editor();
    if (!instance) return;

    instance.destroy();
    this.editor.set(null); // Important to reset the signal
  }

  // Convert content to markdown
  convertToMarkdown(): void {
    const html = this.content();
    if (!html.trim()) {
      this.markdownContent.set('');
      return;
    }

    const markdown = this.turndownService.turndown(html);
    this.markdownContent.set(markdown);
  }

  // Method to update content (call this when editor content chnages)
  updateContent(newContent: string): void {
    this.content.set(newContent);
  }

  convertAndCopyMarkdown(): void {
    const html = this.content();

    if (!html.trim()) {
      this.markdownContent.set('');
      this.alertService.info('No Content', 'No content to copy. Please enter some text first.');
      return;
    }

    const markdown = this.turndownService.turndown(html);
    this.markdownContent.set(markdown);

    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        this.alertService.success('Success', 'Markdown converted and copied to clipboard! ✅');
      })
      .catch(err => {
        console.error('Clipboard error:', err);
        this.alertService.error('Copy Failed', 'Failed to copy Markdown');
      });
  }

  convertAndDownloadMarkdown(): void {
    const html = this.content();

    if (!html.trim()) {
      this.markdownContent.set('');
      this.alertService.info('No Content', 'No content to download. Please enter some text first.');
      return;
    }

    const markdown = this.turndownService.turndown(html);
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
  }

  // Get Markdown content
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

  // Import markdown functionality
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

  importMarkdownFromText(markdownText: string): void {
    try {
      // Convert markdown to HTML using marked
      const html = marked(markdownText) as string;

      // Set the HTML content in the editor
      this.setContent(html);

      // Also update the markdown content signal
      this.markdownContent.set(markdownText);
    } catch (error) {
      console.error('Failed to import markdown:', error);
      this.alertService.error('Parse Error', 'Failed to parse markdown content');
    }
  }

  // Import from URL functionality
  async importFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdownText = await response.text();
      this.importMarkdownFromText(markdownText);
      this.alertService.success('Import Complete', 'Successfully imported from URL');
    } catch (error) {
      console.error('Failed to import from URL:', error);
      this.alertService.error('Import Failed', 'Failed to import from URL');
    }
  }
}
