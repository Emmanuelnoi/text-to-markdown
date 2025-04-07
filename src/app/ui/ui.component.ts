import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, signal, Signal, ViewChild, WritableSignal } from '@angular/core';
import { LucideAngularModule, Keyboard, ClipboardCopy, ArrowDownToLine, BadgeHelp,RefreshCcw } from 'lucide-angular';
import { RichtextComponent } from "../richtext/richtext.component";
import { EditorService } from '../services/editor.service';
import { CommonModule } from '@angular/common';
import { ComponentStateService } from '../services/component-state.service';
import { GuideComponent } from "../guide/guide.component";
import { AlertService } from '../services/alert.service';
import { AlertContainerComponent } from "../alert-container/alert-container.component";

@Component({
  selector: 'app-ui',
  imports: [CommonModule,
    LucideAngularModule,
    RichtextComponent, GuideComponent, AlertContainerComponent],
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
  private alertService = inject(AlertService);


  @ViewChild('markdownPreview', { static: false}) markdownPreviewRef!: ElementRef<HTMLElement>;


  // Accessing the signal from the service
  isComponentVisible = this.componentStateService.getComponentVisibility();
  content: Signal<string> = this.editorService.content; // Get editor content
  markdownContent: WritableSignal<string> = this.editorService.markdownContent; // Get markdown content
  isLoading = signal(false); // Track loading state

  ngOnInit() {}

  ngOnDestroy() {
    this.editorService.destroyEditor();
  }

  copyMarkdown() {
    this.editorService.convertAndCopyMarkdown();
  }
  
  
  ngAfterViewInit() {
    // safe to scroll or use ViewChild here
    this.scrollToPreview()
  }

  scrollToPreview() {
    if (this.markdownPreviewRef) {
      this.markdownPreviewRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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

