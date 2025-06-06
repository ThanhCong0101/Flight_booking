/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CardFilterComponent } from './card-filter.component';

describe('CardFilterComponent', () => {
  let component: CardFilterComponent;
  let fixture: ComponentFixture<CardFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
