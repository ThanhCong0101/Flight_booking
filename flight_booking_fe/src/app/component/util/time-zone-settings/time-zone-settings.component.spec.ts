import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeZoneSettingsComponent } from './time-zone-settings.component';

describe('TimeZoneSettingsComponent', () => {
  let component: TimeZoneSettingsComponent;
  let fixture: ComponentFixture<TimeZoneSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeZoneSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeZoneSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
