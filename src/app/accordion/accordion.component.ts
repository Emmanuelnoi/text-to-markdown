import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-accordion',
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.css',
})
export class AccordionComponent {
  @Input() title = 'Help Center';
  @Input() items: AccordionItem[] = [];
  @Input() titleBgColor = 'bg-gray-50'; //Default background color

  openItem: string | null = null;

  toggleItem(id: string): void {
    this.openItem = this.openItem === id ? null : id;
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }
}
