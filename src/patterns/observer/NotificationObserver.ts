import type { Observer } from './Observer';

export interface ConsultationEvent {
  consultationId: string;
  action: 'created' | 'updated' | 'closed';
}

export class NotificationObserver
  implements Observer<ConsultationEvent> {

  update(data: ConsultationEvent): void {
    console.log(
      `[Notification] Consultation ${data.consultationId} ${data.action}`
    );
  }
}