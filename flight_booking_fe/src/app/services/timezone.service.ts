import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TIMEZONE_KEY } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class TimezoneService {
  private currentTimezone = new BehaviorSubject<string>(
    this.getDefaultTimezone()
  );

  getCurrentTimezone() {
    return this.currentTimezone.asObservable();
  }

  setTimezone(timezone: string) {
    localStorage.setItem(TIMEZONE_KEY, timezone);
    this.currentTimezone.next(timezone);
  }

  private getDefaultTimezone(): string {
    return (
      localStorage.getItem(TIMEZONE_KEY) ||
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
  }
}
