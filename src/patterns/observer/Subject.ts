import type { Observer } from './Observer';

export class Subject<T = unknown> {
  private observers: Observer<T>[] = [];

  subscribe(observer: Observer<T>): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: Observer<T>): void {
    this.observers = this.observers.filter(
      (item) => item !== observer
    );
  }

  notify(data: T): void {
    this.observers.forEach(
      (observer) => observer.update(data)
    );
  }
}