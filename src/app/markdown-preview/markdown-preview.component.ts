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

  private readonly hasBeenConverted = signal(false);
  private readonly lastConvertedContent = signal('');
  private readonly currentEditorContent = signal('');

  private readonly contentWatcherEffect = effect(() => {
    const editorContent = this.editorService.content();
    this.currentEditorContent.set(editorContent);

    if (this.hasBeenConverted() && editorContent != this.lastConvertedContent()) {
      this.hasBeenConverted.set(false);
    }
  });

  ngOnInit(): void {
    this.isOpen = this.isOpenByDefault;
  }

  ngOnDestroy(): void {
    this.contentWatcherEffect.destroy();
  }

  togglePreview() {
    this.isOpen = !this.isOpen;
  }

  isConvertDisabled(): boolean {
    if (this.isConverting) return true;

    const editorContent = this.currentEditorContent();
    if (!editorContent || editorContent.trim().length === 0) return true;

    if (this.hasBeenConverted() && editorContent === this.lastConvertedContent()) return true;

    return false;
  }

  async onConvert(event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }

    if (this.isConvertDisabled()) return;

    this.isConverting = true;

    try {
      const currentContent = this.currentEditorContent();
      await this.editorService.convertToMarkdown();

      this.hasBeenConverted.set(true);
      this.lastConvertedContent.set(currentContent);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      this.isConverting = false;
    }
  }
}
