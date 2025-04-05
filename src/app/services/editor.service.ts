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
  private editor!: Editor;
  private turndownService = new TurndownService();

  // Signal to track editor content
  content: WritableSignal<string> = signal('');
  markdownContent: WritableSignal<string> = signal(''); // store Markdown content

  constructor() {
    this.initializeEditor();
  }

  // Initialize the Tiptap editor
  private initializeEditor(){
      this.editor = new Editor({
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
    }

  // Get the Tiptap editor instance
  getEditor(): Editor {
    return this.editor;
  }

  // Update editor content
  setContent(content: string) {
    this.editor.commands.setContent(content);
    this.content.set(content);
  }

  // Get editor content
  getContent(): string {
    return this.content();
  }

  // Clear editor content
  clearContent() {
    this.editor.commands.clearContent();
    this.content.set('');
  }

  // Destroy editor when component is destroyed
  destroyEditor() {
    this.editor.destroy();
  }

  // Convert Tiptap HTML to Markdown
  convertToMarkdown() {
    this.markdownContent.set(this.turndownService.turndown(this.content()))
  }

  // Copy Markdown to Clipboard
  copyToClipboard(){
    navigator.clipboard.writeText(this.markdownContent()).then(() => {
      alert('Markdown copied to clipboard! ✅');
    });
  }

  // Download Markdown to Clipboard
  downloadMarkdown(){
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
