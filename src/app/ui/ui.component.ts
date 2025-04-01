import { Component } from '@angular/core';
import { LucideAngularModule, Keyboard, ClipboardCopy, ArrowDownToLine, BadgeHelp } from 'lucide-angular';

@Component({
  selector: 'app-ui',
  imports: [LucideAngularModule],
  templateUrl: './ui.component.html',
  styleUrl: './ui.component.css'
})
export class UiComponent {
  readonly Keyboard = Keyboard;
  readonly ClipboardCopy = ClipboardCopy;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly BadgeHelp = BadgeHelp;

  showKeyboardShortcuts(){

  }

  copyToClipboard(){

  }

  downloadMarkdown(){}

  showHelp(){}

} 
