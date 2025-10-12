import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorService } from '../services/editor.service';
import { AnalyticsService } from '../services/analytics.service';

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

  templates = {
    readme: `# Project Name

## Description
Brief description of your project.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
How to use your project.

## Contributing
Guidelines for contributing.

## License
Your license here.`,

    blog: `# Blog Post Title

*Published on ${new Date().toLocaleDateString()}*

## Introduction
Your introduction here...

## Main Content
Your main content here...

### Subheading
More detailed content...

## Conclusion
Your conclusion here...

---
*Tags: #tag1 #tag2 #tag3*`,

    meeting: `# Meeting Notes - ${new Date().toLocaleDateString()}

## Attendees
- Name 1
- Name 2
- Name 3

## Agenda
1. Item 1
2. Item 2
3. Item 3

## Discussion Points
### Topic 1
Notes...

### Topic 2
Notes...

## Action Items
- [ ] Action item 1 - @assignee - Due: date
- [ ] Action item 2 - @assignee - Due: date

## Next Meeting
Date: TBD
Time: TBD`,

    docs: `# Documentation Title

## Overview
Brief overview of the feature/component.

## Installation
\`\`\`bash
npm install package-name
\`\`\`

## API Reference

### Method Name
\`\`\`typescript
methodName(param: string): ReturnType
\`\`\`

**Parameters:**
- \`param\`: Description of parameter

**Returns:**
Description of return value

**Example:**
\`\`\`typescript
const result = methodName('value');
\`\`\`

## Examples
More detailed examples...

## Troubleshooting
Common issues and solutions.`,
  };

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

  async loadTemplate(templateKey: keyof typeof this.templates): Promise<void> {
    const template = this.templates[templateKey];
    await this.editorService.importMarkdownFromText(template);
    this.analytics.trackEvent('Template Used', { template: templateKey });
    this.close();
  }
}
