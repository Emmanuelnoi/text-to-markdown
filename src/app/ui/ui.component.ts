import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
  AfterViewInit,
} from '@angular/core';
import {
  LucideAngularModule,
  Keyboard,
  ClipboardCopy,
  ArrowDownToLine,
  BadgeHelp,
  RefreshCcw,
  X,
  Import,
} from 'lucide-angular';
import { RichtextComponent } from '../richtext/richtext.component';
import { EditorService } from '../services/editor.service';
import { CommonModule } from '@angular/common';
import { ComponentStateService } from '../services/component-state.service';
import { AlertService } from '../services/alert.service';
import { ThemeService } from '../services/theme.service';
import { AlertContainerComponent } from '../alert-container/alert-container.component';
import { HelpsectionComponent } from '../helpsection/helpsection.component';
import { MarkdownPreviewComponent } from '../markdown-preview/markdown-preview.component';
import { ImportModalComponent } from '../import-modal/import-modal.component';

@Component({
  selector: 'app-ui',
  imports: [
    CommonModule,
    LucideAngularModule,
    RichtextComponent,
    AlertContainerComponent,
    HelpsectionComponent,
    MarkdownPreviewComponent,
    ImportModalComponent,
  ],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css',
})
export class UiComponent implements OnDestroy, AfterViewInit {
  readonly Keyboard = Keyboard;
  readonly ClipboardCopy = ClipboardCopy;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly BadgeHelp = BadgeHelp;
  readonly RefreshCcw = RefreshCcw;
  readonly X = X;
  readonly Import = Import;

  private editorService = inject(EditorService); // inject editorService using 'inject'
  private componentStateService = inject(ComponentStateService); // inject componentStateService using 'inject'
  private cd = inject(ChangeDetectorRef);
  private alertService = inject(AlertService);
  private themeService = inject(ThemeService);

  @ViewChild('markdownPreview', { static: false }) markdownPreviewRef!: ElementRef<HTMLElement>;

  // Accessing the signal from the service
  isComponentVisible = this.componentStateService.getComponentVisibility();
  content: Signal<string> = this.editorService.content; // Get editor content
  markdownContent: WritableSignal<string> = this.editorService.markdownContent; // Get markdown content
  isLoading = signal(false); // Track loading state
  showImportModal = false; // Control import modal visibility

  // Theme-related signals
  isDarkMode = this.themeService.isDarkMode;

  ngOnDestroy() {
    this.editorService.destroyEditor();
  }

  copyMarkdown() {
    this.editorService.convertAndCopyMarkdown();
  }

  ngAfterViewInit() {
    // safe to scroll or use ViewChild here
    this.scrollToPreview();
  }

  scrollToPreview() {
    if (this.markdownPreviewRef) {
      this.markdownPreviewRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Download Markdown to Clipboard
  downloadMarkdown() {
    this.editorService.convertAndDownloadMarkdown();
  }

  // Show markdown content if it's not empty
  showMarkdown(): boolean {
    return this.markdownContent() !== '';
  }

  // Clear editor content and reset markdown content
  clearContent() {
    this.editorService.clearContent();
    this.markdownContent.set('');
  }

  // In your app component, when editor content changes:
  onEditorContentChange(newContent: string) {
    this.editorService.updateContent(newContent);
  }

  // Import modal controls
  openImportModal(): void {
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  // Dark mode toggle
  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}
