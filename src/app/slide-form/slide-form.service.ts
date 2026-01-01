
import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlideFormService {

  private openSubject = new Subject<any>();
  open$ = this.openSubject.asObservable();

  private closeSubject = new Subject<void>();
  close$ = this.closeSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  private overlapSubject = new BehaviorSubject<boolean>(false);
  overlap$ = this.overlapSubject.asObservable();

  openForm(data?: any) {
    this.errorSubject.next(null);
    this.overlapSubject.next(false);
    this.openSubject.next(data);
  }

  close() {
    this.errorSubject.next(null);
    this.overlapSubject.next(false);
    this.closeSubject.next();
  }

  setError(message: string) {
    this.errorSubject.next(message);
    this.overlapSubject.next(true);
  }

  clearError() {
    this.errorSubject.next(null);
    this.overlapSubject.next(false);
  }
}

