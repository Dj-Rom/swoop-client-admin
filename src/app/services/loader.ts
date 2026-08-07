// services/loader/loader.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private activeRequests = 0;
  private loadingSubject = signal<boolean>(false);
  private textSubject = signal<string>('');

  loading = this.loadingSubject.asReadonly();
  text = this.textSubject.asReadonly();

  show(text: string = 'Loading...'): void {
    this.activeRequests++;
    this.textSubject.set(text);
    this.loadingSubject.set(true);
  }

  hide(): void {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this.loadingSubject.set(false);
      this.textSubject.set('');
    }
  }

  reset(): void {
    this.activeRequests = 0;
    this.loadingSubject.set(false);
    this.textSubject.set('');
  }
}
