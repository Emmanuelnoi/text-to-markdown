import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { EditorService } from '../services/editor.service';

@Component({
  selector: 'app-markdown-preview',
  imports: [CommonModule],
  templateUrl: './markdown-preview.component.html',
  styleUrl: './markdown-preview.component.css',
})
export class MarkdownPreviewComponent implements OnInit, OnDestroy {
  @Input() title = 'Markdown Preview';
  @Input() markdownContent!: WritableSignal<string>;
  @Input() isOpenByDefault = true;

  private readonly editorService = inject(EditorService);

  isOpen = true;
  isConverting = false;

  // Track conversion state
  private readonly hasBeenConverted = signal(false);
  private readonly lastConvertedContent = signal('');
  private readonly currentEditorContent = signal('');

  // Store effect reference for cleanup
  private readonly contentWatcherEffect = effect(() => {
    const editorContent = this.editorService.content();
    this.currentEditorContent.set(editorContent);

    // If content changes after conversion, enable the convert button
    if (this.hasBeenConverted() && editorContent != this.lastConvertedContent()) {
      this.hasBeenConverted.set(false);
    }
  });

  ngOnInit(): void {
    this.isOpen = this.isOpenByDefault;
  }

  ngOnDestroy(): void {
    // Clean up the effect to prevent memory leaks
    this.contentWatcherEffect.destroy();
  }

  togglePreview() {
    this.isOpen = !this.isOpen;
  }

  isConvertDisabled(): boolean {
    // Disable if currently converting
    if (this.isConverting) return true;

    // Disable if no content in editor
    const editorContent = this.currentEditorContent();
    if (!editorContent || editorContent.trim().length === 0) return true;

    // Disable if already converted and no changes made
    if (this.hasBeenConverted() && editorContent === this.lastConvertedContent()) return true;

    return false;
  }

  onConvert(event?: Event): void {
    // Prevent event propagation if event is provided
    if (event) {
      event.stopPropagation();
    }

    // Don't convert if disabled
    if (this.isConvertDisabled()) return;

    // Set loading state
    this.isConverting = true;

    try {
      // Store the current content before conversion
      const currentContent = this.currentEditorContent();

      // Call the void convertToMarkdown method
      // This will update the markdownContent signal internally
      this.editorService.convertToMarkdown();

      // Mark as converted and store the content that was converted
      this.hasBeenConverted.set(true);
      this.lastConvertedContent.set(currentContent);

      // Show success feedback
    } catch (error) {
      console.error('Conversion failed:', error);
      // Show error feedback
    } finally {
      // Reset loading state
      this.isConverting = false;
    }
  }
}
