import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-guide',
  imports: [CommonModule],
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.css'
})
export class GuideComponent {
  isOpen = signal(true)

  closeModal() {
    this.isOpen.set(false)
  }
}
