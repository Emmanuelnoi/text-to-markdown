import { Injectable, signal, WritableSignal } from '@angular/core';
import { Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapUnderline from '@tiptap/extension-underline'
import TiptapHeading from '@tiptap/extension-heading';
import StarterKit from '@tiptap/starter-kit';
import TurndownService from 'turndown';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  // Signal to track editor content
  editor = signal<Editor | null>(null);
  readonly content: WritableSignal<string> = signal('');
  readonly markdownContent: WritableSignal<string> = signal(''); // store Markdown content


  private turndownService = new TurndownService();

  constructor() {
    this.initializeEditor();
  }

  // Initialize the Tiptap editor
  private initializeEditor(){
    const tiptapEditor = new Editor({
        extensions: [
          StarterKit,
          Placeholder,
          TiptapUnderline,
          TiptapHeading.configure({
            levels: [1],
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


  // Convert Tiptap HTML to Markdown
  // convertToMarkdown() {
  //   const html = this.content();
  //   if (!html.trim()) return; // do nothing if empty
  
  //   this.markdownContent.set(this.turndownService.turndown(html));
  // }

  convertToMarkdown(): void {
    const html = this.content().trim();

    if (!html) {
      alert('No content to convert to Markdown.');
      return;
    }

    try {
      const markdown = this.turndownService.turndown(html);
      this.markdownContent.set(markdown);
    } catch (error) {
      console.error('Markdown conversion failed:', error);
      alert('Something went wrong while converting.');
    }
  }

  // Copy Markdown to Clipboard
  copyToClipboard() {
    // Check if markdown content is not empty before copying
    if (this.markdownContent() === '') {
      alert('No content to copy. Please convert some text to Markdown first. ❌');
      return;
    }
  
    // Proceed to copy content to clipboard if it's not empty
    navigator.clipboard.writeText(this.markdownContent()).then(() => {
      alert('Markdown copied to clipboard! ✅');
    }).catch(err => {
      alert('Failed to copy markdown ❌');
      console.error(err);
    });
  }
  

  // Download Markdown to Clipboard
  downloadMarkdown(){
    if (this.markdownContent() === '') {
      alert('No content to Download. Please convert some text to Markdown first. ❌');
      return;
    }

    // Proceed to Download conten if it's not empty
    const blob = new Blob([this.markdownContent()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
    a.click();
    URL.revokeObjectURL(url);
  }
  
   // Get Markdown content
   getMarkdown(): string {
    return this.markdownContent();
  }
}
