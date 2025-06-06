import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardDetailLegComponent } from './card-detail-leg.component';

describe('CardDetailLegComponent', () => {
  let component: CardDetailLegComponent;
  let fixture: ComponentFixture<CardDetailLegComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardDetailLegComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardDetailLegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
