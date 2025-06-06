/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PastBookingComponent } from './past-booking.component';

describe('PastBookingComponent', () => {
  let component: PastBookingComponent;
  let fixture: ComponentFixture<PastBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
