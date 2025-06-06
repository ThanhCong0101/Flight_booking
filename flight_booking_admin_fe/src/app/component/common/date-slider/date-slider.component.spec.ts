/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DateSliderComponent } from './date-slider.component';

describe('DateSliderComponent', () => {
  let component: DateSliderComponent;
  let fixture: ComponentFixture<DateSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
