import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiComponent } from "./ui/ui.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, UiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  title: string | undefined;

}



