/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ItineraryTableComponent } from './itinerary-table.component';

describe('ItineraryTableComponent', () => {
  let component: ItineraryTableComponent;
  let fixture: ComponentFixture<ItineraryTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItineraryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
