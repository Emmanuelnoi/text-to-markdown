import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Heading, Bold, Italic, Strikethrough, Underline, Code } from 'lucide-angular';

import { TiptapBubbleMenuDirective, TiptapEditorDirective } from 'ngx-tiptap';
import { EditorService } from '../services/editor.service';
import { Editor } from '@tiptap/core';

@Component({
  selector: 'app-richtext',
  imports: [ 
    CommonModule, 
    FormsModule, 
    TiptapBubbleMenuDirective, 
    TiptapEditorDirective, 
    LucideAngularModule 
  ],
  templateUrl: './richtext.component.html',
  styleUrl: './richtext.component.css'
})
export class RichtextComponent implements OnInit, OnDestroy{

  readonly Heading = Heading;
  readonly Bold = Bold;
  readonly Italic = Italic;
  readonly Strikethrough = Strikethrough;
  readonly Underline = Underline;
  readonly Code = Code;

  private editorService = inject(EditorService); //inject editorService using 'inject'
  content: Signal<string> = this.editorService.content // Bind signal directly

  readonly editor = this.editorService.editor;

  ngOnInit() {}

  ngOnDestroy(){
    this.editorService.destroyEditor();
  }

  
  // Safe getter for editor
  get safeEditor(): Editor {
    const editorInstance = this.editorService.editor();
    if (!editorInstance) {
      throw new Error('Editor is not initialized');
    }
    return editorInstance;
  }

}
