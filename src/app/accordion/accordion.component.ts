import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AccordionItem } from './accordion.models';

@Component({
  selector: 'app-accordion',
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.css',
})
export class AccordionComponent {
  @Input() title = 'Help Center';
  @Input() items: AccordionItem[] = [];

  openItem: string | null = null;

  toggleItem(id: string): void {
    this.openItem = this.openItem === id ? null : id;
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }
}
