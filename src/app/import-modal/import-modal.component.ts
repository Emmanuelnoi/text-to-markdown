import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorService } from '../services/editor.service';
import { AnalyticsService } from '../services/analytics.service';
import { IMPORT_TEMPLATES, ImportTemplateKey } from './import-modal.templates';

@Component({
  selector: 'app-import-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './import-modal.component.html',
  styleUrl: './import-modal.component.css',
})
export class ImportModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  private readonly editorService = inject(EditorService);
  private readonly analytics = inject(AnalyticsService);

  importUrl = '';
  isImporting = false;
  isDragOver = false;

  readonly templates = IMPORT_TEMPLATES;

  close(): void {
    this.closeModal.emit();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private async handleFile(file: File): Promise<void> {
    try {
      await this.editorService.importMarkdownFromFile(file);
      this.close();
    } catch (error) {
      console.error('Failed to import file:', error);
    }
  }

  async importFromUrl(): Promise<void> {
    if (!this.importUrl) return;

    this.isImporting = true;
    try {
      await this.editorService.importFromUrl(this.importUrl);
      this.importUrl = '';
      this.close();
    } catch (error) {
      console.error('Failed to import from URL:', error);
    } finally {
      this.isImporting = false;
    }
  }

  async loadTemplate(templateKey: ImportTemplateKey): Promise<void> {
    const template = this.templates[templateKey];
    await this.editorService.importMarkdownFromText(template);
    this.analytics.trackEvent('Template Used', { template: templateKey });
    this.close();
  }
}
