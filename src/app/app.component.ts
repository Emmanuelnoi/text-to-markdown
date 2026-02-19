import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  OnDestroy,
  WritableSignal,
} from '@angular/core';
import { ArrowDownToLine, ClipboardCopy, Import, LucideAngularModule, X } from 'lucide-angular';
import { AccordionComponent } from './accordion/accordion.component';
import { HELP_ACCORDION_ITEMS } from './accordion/accordion.models';
import { AlertComponent } from './alert/alert.component';
import { ImportModalComponent } from './import-modal/import-modal.component';
import { MarkdownPreviewComponent } from './markdown-preview/markdown-preview.component';
import { RichtextComponent } from './richtext/richtext.component';
import { AlertService } from './services/alert.service';
import { EditorService } from './services/editor.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    LucideAngularModule,
    RichtextComponent,
    MarkdownPreviewComponent,
    ImportModalComponent,
    AccordionComponent,
    AlertComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnDestroy, AfterViewInit {
  readonly ClipboardCopy = ClipboardCopy;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly X = X;
  readonly Import = Import;

  readonly helpAccordionItems = HELP_ACCORDION_ITEMS;
  readonly markdownContent: WritableSignal<string>;
  readonly isDarkMode;

  private readonly editorService = inject(EditorService);
  readonly alertService = inject(AlertService);
  private readonly themeService = inject(ThemeService);

  @ViewChild('markdownPreview', { static: false }) markdownPreviewRef!: ElementRef<HTMLElement>;

  showImportModal = false;

  constructor() {
    this.markdownContent = this.editorService.markdownContent;
    this.isDarkMode = this.themeService.isDarkMode;
  }

  ngOnDestroy() {
    this.editorService.destroyEditor();
  }

  ngAfterViewInit() {
    this.scrollToPreview();
  }

  scrollToPreview() {
    if (this.markdownPreviewRef) {
      this.markdownPreviewRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  copyMarkdown() {
    this.editorService.convertAndCopyMarkdown();
  }

  downloadMarkdown() {
    this.editorService.convertAndDownloadMarkdown();
  }

  clearContent() {
    this.editorService.clearContent();
    this.editorService.markdownContent.set('');
  }

  openImportModal(): void {
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }
}
