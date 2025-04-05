import { Component, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { LucideAngularModule, Keyboard, ClipboardCopy, ArrowDownToLine, BadgeHelp,RefreshCcw } from 'lucide-angular';
import { RichtextComponent } from "../richtext/richtext.component";
import { EditorService } from '../services/editor.service';

@Component({
  selector: 'app-ui',
  imports: [
    LucideAngularModule, 
    RichtextComponent
  ],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css'
})
export class UiComponent implements OnInit, OnDestroy{
  readonly Keyboard = Keyboard;
  readonly ClipboardCopy = ClipboardCopy;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly BadgeHelp = BadgeHelp;
  readonly RefreshCcw = RefreshCcw;

  private editorService = inject(EditorService);

  content: Signal<string> = this.editorService.content // Get editor content
  markdownContent: Signal<string> =this.editorService.markdownContent; // GEt markdown content

  // Signal to control <pre> visibility
  showMarkdown = signal(false);
  
 
  convertMarkdown() {
    this.editorService.convertToMarkdown(); // Convert to Markdown


    // show <pre> only after clicking
    this.showMarkdown.set(true);
  }
  ngOnInit() {}

  showKeyboardShortcuts(){}

  // Copy Markdown to Clipboard
  copyToClipboard(){
    this.editorService.copyToClipboard();
  }

  // Download Markdown to Clipboard
  downloadMarkdown(){
    this.editorService.downloadMarkdown();
  }

  showHelp(){}

  ngOnDestroy(): void {
      this.editorService.destroyEditor();
  }

} 
