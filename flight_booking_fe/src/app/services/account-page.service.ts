// src/app/account/account.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'  // or 'AccountModule' if you only need it in this module
})
export class AccountPageService {
  // Define a BehaviorSubject to hold the data you want to share
  private sharedDataSubject = new BehaviorSubject<any>(null);
  sharedData$ = this.sharedDataSubject.asObservable();

  // Method to update data
  setSharedData(data: any) {
    this.sharedDataSubject.next(data);
  }
}
