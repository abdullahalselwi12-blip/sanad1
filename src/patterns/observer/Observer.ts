export interface Observer<T = unknown> {
  update(data: T): void;
}