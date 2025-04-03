import { Component, Signal, signal, WritableSignal } from '@angular/core';
import { LucideAngularModule, Keyboard, ClipboardCopy, ArrowDownToLine, BadgeHelp,RefreshCcw } from 'lucide-angular';
import { RichtextComponent } from "../richtext/richtext.component";
import TurndownService from 'turndown'

@Component({
  selector: 'app-ui',
  imports: [LucideAngularModule, RichtextComponent],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css'
})
export class UiComponent {
  readonly Keyboard = Keyboard;
  readonly ClipboardCopy = ClipboardCopy;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly BadgeHelp = BadgeHelp;
  readonly RefreshCcw = RefreshCcw;

  // Signal to store child data
  editorContent: WritableSignal<string> = signal('');
  markdownOutput: string = '';
  turndownService = new TurndownService(); // Initialize Turndown

  //run both functions
  convertToMarkdown(contentSignal: WritableSignal<string>){
    this.receiveContent(contentSignal);
    this.convertMarkdown();
  }

  // Function to get content from child
  receiveContent(signalContent: WritableSignal<string>){
    this.editorContent = signalContent;
  }

  // Convert Tiptap's HTML Content to Markdown
  convertMarkdown() {
    this.markdownOutput = this.turndownService.turndown(this.editorContent());
  }


  showKeyboardShortcuts(){

  }

  // Copy Markdown to Clipboard
  copyToClipboard(){
    navigator.clipboard.writeText(this.markdownOutput).then(() => {
      alert('Markdown copied to clipboard! ✅');
    });
  }

  // Download Markdown to Clipboard
  downloadMarkdown(){
    const blob = new Blob([this.markdownOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  showHelp(){}

} 
