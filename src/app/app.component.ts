import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { RichtextComponent } from "./richtext/richtext.component";
import { UiComponent } from "./ui/ui.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, UiComponent, RichtextComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  title: any;

}



