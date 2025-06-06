import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimezoneService } from 'src/app/services/timezone.service';
import { userService } from 'src/app/services/user.service';

@Component({
  selector: 'app-time-zone-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-zone-settings.component.html',
  styleUrl: './time-zone-settings.component.css',
})
export class TimeZoneSettingsComponent {
  selectedTimezone = signal(Intl.DateTimeFormat().resolvedOptions().timeZone);
  modal = viewChild<ElementRef>('timezoneModal');
  private previousTimezone: string = '';

  currentTimezone = signal<string>('');
  timezones: string[] = Intl.supportedValuesOf('timeZone');

  constructor(
    private timezoneService: TimezoneService,
    private userService: userService
  ) {}

  ngOnInit(): void {
    this.timezoneService
      .getCurrentTimezone()
      .subscribe((timezone) => this.currentTimezone.set(timezone));
  }

  // onTimezoneChange(event: any) {
  //   this.timezoneService.setTimezone(event.target.value);
  // }

  onTimezoneChange(event: any) {
    this.previousTimezone = this.currentTimezone();
    this.modal()!.nativeElement.showModal();
  }

  confirmTimezoneChange(saveToProfile: boolean) {
    if (saveToProfile) {
      // Call API to save timezone preference
      this.userService
        .updateTimezonePreference(this.selectedTimezone())
        .subscribe({
          next: () => {
            this.timezoneService.setTimezone(this.selectedTimezone());
            // localStorage.setItem('userTimezone', this.selectedTimezone());
            this.modal()!.nativeElement.close();
          },
          error: () => {
            // Handle error
          },
        });
    } else {
      // Only save locally
      // localStorage.setItem('userTimezone', this.selectedTimezone);
      this.timezoneService.setTimezone(this.selectedTimezone());
      this.modal()!.nativeElement.close();
    }
  }

  cancelTimezoneChange() {
    this.selectedTimezone.update(() => this.previousTimezone);
    this.modal()!.nativeElement.close();
  }
}
