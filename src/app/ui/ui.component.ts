import { ChangeDetectorRef, Component, Inject, inject, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { LucideAngularModule, Keyboard, ClipboardCopy, ArrowDownToLine, BadgeHelp,RefreshCcw } from 'lucide-angular';
import { RichtextComponent } from "../richtext/richtext.component";
import { EditorService } from '../services/editor.service';
import { CommonModule } from '@angular/common';
import { ComponentStateService } from '../services/component-state.service';
import { GuideComponent } from "../guide/guide.component";

@Component({
  selector: 'app-ui',
  imports: [CommonModule,
    LucideAngularModule,
    RichtextComponent, GuideComponent],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css'
})
export class UiComponent implements OnInit, OnDestroy{
  readonly Keyboard = Keyboard;
  readonly ClipboardCopy = ClipboardCopy;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly BadgeHelp = BadgeHelp;
  readonly RefreshCcw = RefreshCcw;

  private editorService = inject(EditorService); // inject editorService using 'inject'
  private componentStateService = inject(ComponentStateService); // inject componentStateService using 'inject'
  private cd = inject(ChangeDetectorRef);

  // Accessing the signal from the service
  isComponentVisible = this.componentStateService.getComponentVisibility();
  content: Signal<string> = this.editorService.content; // Get editor content
  markdownContent: WritableSignal<string> = this.editorService.markdownContent; // Get markdown content

  isLoading = signal(false); // Track loading state

  ngOnInit() {}

  ngOnDestroy() {
    this.editorService.destroyEditor();
  }

  // Convert to Markdown
  async convertMarkdown() {
    const contentValue = this.content();

    if (contentValue.trim() === '') {
      alert('No content to convert to Markdown.');
      return;
    }

    this.isLoading.set(true);  // Set loading to true

    try {
      await this.editorService.convertToMarkdown();
    } catch (error) {
      console.error('Markdown conversion failed', error);
    } finally {
      this.isLoading.set(false); // Set loading to false
    }
  }

  // Show keyboard shortcuts
  showKeyboardShortcuts() {}

  // Copy Markdown to Clipboard
  copyToClipboard() {
    this.editorService.copyToClipboard();
  }

  // Download Markdown to Clipboard
  downloadMarkdown() {
    this.editorService.downloadMarkdown();
  }

  // Show markdown content if it's not empty
  showMarkdown(): boolean {
    return this.markdownContent() !== '';
  }

  // Show help
  showHelp() {
    this.componentStateService.toggleVisibility()
    this.cd.detectChanges(); // Force change detection
  }

  // Clear editor content and reset markdown content
  clearContent() {
    this.editorService.clearContent(); // Call the clearContent method from editorService
    this.markdownContent.set(''); // Reset markdown content to empty string
  }
}
