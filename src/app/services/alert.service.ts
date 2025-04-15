import { Injectable, signal } from '@angular/core';
import { AlertType } from '../alert/alert.component';

export interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
private nextId = 0;
  alerts = signal<Alert[]>([]);
  
  show(type: AlertType, title: string, message: string, autoClose = true, duration = 5000): number {
    const id = this.nextId++;
    
    const alert: Alert = {
      id,
      type,
      title,
      message,
      autoClose,
      duration
    };
    
    this.alerts.update(alerts => [...alerts, alert]);
    
    if (autoClose) {
      setTimeout(() => this.close(id), duration);
    }
    
    return id;
  }
  
  success(title: string, message: string, autoClose = true, duration = 5000): number {
    return this.show('success', title, message, autoClose, duration);
  }
  
  warning(title: string, message: string, autoClose = true, duration = 5000): number {
    return this.show('warning', title, message, autoClose, duration);
  }
  
  error(title: string, message: string, autoClose = true, duration = 5000): number {
    return this.show('error', title, message, autoClose, duration);
  }
  
  info(title: string, message: string, autoClose = true, duration = 5000): number {
    return this.show('info', title, message, autoClose, duration);
  }
  
  close(id: number): void {
    this.alerts.update(alerts => alerts.filter(alert => alert.id !== id));
  }
  
  clearAll(): void {
    this.alerts.set([]);
  }

}
