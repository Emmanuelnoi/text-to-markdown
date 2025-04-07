import { Component, inject } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { AlertComponent } from '../alert/alert.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-container',
  imports: [CommonModule, AlertComponent],
  templateUrl: './alert-container.component.html',
  styleUrl: './alert-container.component.css'
})
export class AlertContainerComponent {
  alertService = inject(AlertService)

}
