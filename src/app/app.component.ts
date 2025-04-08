import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { UiComponent } from "./ui/ui.component";
import { GuideComponent } from "./guide/guide.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, UiComponent, GuideComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {

  title: any;

}



