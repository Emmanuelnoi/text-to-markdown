import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentStateService {
  // Signal to track the visibility of the component
  private isComponentVisible: WritableSignal<boolean> = signal(false);

  // Getter and Setter to manage the signal state
  getComponentVisibility(): WritableSignal<boolean> {
    return this.isComponentVisible;
  }

  toggleVisibility(): void {
    this.isComponentVisible.update((prevState) => !prevState);
  }
}
