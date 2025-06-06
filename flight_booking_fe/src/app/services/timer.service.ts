import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timeoutSubject = new BehaviorSubject<number>(300);
  public timeout$ = this.timeoutSubject.asObservable();
  private timer: any;

  startTimer() {
    const startTimestamp = localStorage.getItem('bookingStartTime');

    if (!startTimestamp) {
      // First time starting timer
      localStorage.setItem('bookingStartTime', Date.now().toString());
      localStorage.setItem('totalDuration', '100');
    }

    const elapsedSeconds = this.calculateElapsedTime();
    const remainingTime = Math.max(100 - elapsedSeconds, 0);

    this.timeoutSubject.next(remainingTime);

    this.timer = setInterval(() => {
      const currentValue = this.timeoutSubject.value;
      if (currentValue > 0) {
        console.log('currentValue', currentValue);
        this.timeoutSubject.next(currentValue - 1);
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  private calculateElapsedTime(): number {
    const startTime = parseInt(localStorage.getItem('bookingStartTime') || '0');
    return Math.floor((Date.now() - startTime) / 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      localStorage.removeItem('bookingStartTime');
      localStorage.removeItem('totalDuration');
    }
  }
}
