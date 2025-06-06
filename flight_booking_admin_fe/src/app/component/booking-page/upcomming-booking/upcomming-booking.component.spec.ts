/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UpcommingBookingComponent } from './upcomming-booking.component';

describe('UpcommingBookingComponent', () => {
  let component: UpcommingBookingComponent;
  let fixture: ComponentFixture<UpcommingBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpcommingBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcommingBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
