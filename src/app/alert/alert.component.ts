import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { trigger, transition, style, animate } from '@angular/animations';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
@Input() type: AlertType = 'info';
@Input() title: string = '';
@Input() message: string = '';
@Output() close = new EventEmitter<void>();

}
