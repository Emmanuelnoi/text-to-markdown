import { CommonModule } from '@angular/common';
import { Component, OnDestroy, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Heading, Bold, Italic, Strikethrough,Underline } from 'lucide-angular';


import { Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline'
import TiptapHeading from '@tiptap/extension-heading';
import { TiptapBubbleMenuDirective, TiptapEditorDirective } from 'ngx-tiptap';

@Component({
  selector: 'app-richtext',
  imports: [ CommonModule, FormsModule, TiptapBubbleMenuDirective, TiptapEditorDirective, 
    LucideAngularModule ],
  templateUrl: './richtext.component.html',
  styleUrl: './richtext.component.css'
})
export class RichtextComponent implements OnDestroy {

  readonly Heading = Heading;
  readonly Bold = Bold;
  readonly Italic = Italic;
  readonly Strikethrough = Strikethrough;
  readonly Underline = Underline;
  value = `"This is a Test run. Remember: Power to you!"`;


  editor = new Editor({
    extensions: [
      StarterKit,
      Placeholder,
      TiptapUnderline,
      TiptapHeading.configure({
        levels: [1],
      })
    ],
    editorProps: {
      attributes: {
        class: 'mt-4 p-10 border-black hover:border-blue-700 focus:border-red-700 border-1 rounded-md outline-none',
        spellCheck: 'false',
      },
    },
  });

  ngOnDestroy(): void {
    this.editor.destroy();
  }

}
