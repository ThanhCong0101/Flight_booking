/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FlightTableComponent } from './flight-table.component';

describe('FlightTableComponent', () => {
  let component: FlightTableComponent;
  let fixture: ComponentFixture<FlightTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
