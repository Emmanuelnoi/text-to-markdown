import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapUnderline from '@tiptap/extension-underline'
import TiptapHeading from '@tiptap/extension-heading';
import Code from '@tiptap/extension-code';
import Link from '@tiptap/extension-link';
import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import CodeBlockLowlight from '@tiptap/extension-code-block'
import StarterKit from '@tiptap/starter-kit';
import TurndownService from 'turndown';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
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
  private initializeEditor(){
    const tiptapEditor = new Editor({
        extensions: [
          StarterKit,
          Placeholder.configure({
            placeholder: 'Start writing your markdown-friendly rich text...',
          }),
          TiptapUnderline,
          Code,
          Link,
          Document,
          Paragraph,
          Text,
          Blockquote,
          BulletList, OrderedList, ListItem,
          CodeBlockLowlight,
          TiptapHeading.configure({
            levels: [1,2,3,4,5,6],
          })
        ],
        onUpdate: ({ editor }) => {
          this.content.set(editor.getHTML()); // Update signal when content changes
        }
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

  convertAndCopyMarkdown(): void {
    const html = this.content();
  
    if (!html.trim()) {
      this.markdownContent.set('');
      this.alertService.info('No content to copy. Please enter some text first.', 'info');
      return;
    }
  
    const markdown = this.turndownService.turndown(html);
    this.markdownContent.set(markdown);
  
    navigator.clipboard.writeText(markdown).then(() => {
      this.alertService.success('Markdown converted and copied to clipboard! ✅', 'success');
    }).catch(err => {
      console.error('Clipboard error:', err);
      this.alertService.error('Failed to copy Markdown', 'error');
    });
  }
  
  convertAndDownloadMarkdown(): void {
    const html = this.content();
  
    if (!html.trim()) {
      this.markdownContent.set('');
      this.alertService.info('No content to download. Please enter some text first.', 'info');
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
  
    this.alertService.success('Markdown converted and downloaded successfully!', 'success');
  }
  
  
   // Get Markdown content
   getMarkdown(): string {
    return this.markdownContent();
  }


  showSuccessAlert() {
    this.alertService.success('Operation Successful!', 'success');
  }

  showErrorAlert() {
    this.alertService.error('Something went wrong!', 'error');
  }

  showInfoAlert() {
    this.alertService.info('No content to convert to Markdown.', 'info');
  }
}
