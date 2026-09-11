import { Subject } from './Subject';
import type { ConsultationEvent } from './NotificationObserver';

export class ConsultationSubject
  extends Subject<ConsultationEvent> {

  consultationCreated(consultationId: string): void {
    this.notify({
      consultationId,
      action: 'created',
    });
  }

  consultationUpdated(consultationId: string): void {
    this.notify({
      consultationId,
      action: 'updated',
    });
  }

  consultationClosed(consultationId: string): void {
    this.notify({
      consultationId,
      action: 'closed',
    });
  }
}

export const consultationSubject =
  new ConsultationSubject();