import {
  Component,
  effect,
  ElementRef,
  OnInit,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { BookingService } from 'src/app/services/booking.service';
import { UserService } from 'src/app/services/user.service';

export interface UserResponse {
  total: number;
  users: User[];
}

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  timezone: string;
  profile_picture: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  isLoading = signal<boolean>(true);
  userResponse = signal<UserResponse>({} as UserResponse);

  resetPasswordDrawer = viewChild<ElementRef>('drawerResetPassword');
  viewBookingsDrawer = viewChild<ElementRef>('drawerViewBookings');

  selectedRole: string = '';
  selectedStatus: string = '';

  searchUserForm!: FormGroup;

  resetPasswordForm!: FormGroup;
  selectedUserId: string = '';

  successMessages: string[] = [];
  errorMessages: string[] = [];

  userBookings: any[] = [];

  totalBookings = signal<number>(1);
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  constructor(
    private _fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private bookingService: BookingService
  ) {
    this.initResetPasswordForm();
  }

  ngOnInit(): void {
    this.initSearchUserForm();
    this.userService
      .getAllUsers(this.currentPage(), this.pageSize())
      .subscribe((users) => {
        console.log('users', users);
        this.totalBookings.set(Math.ceil(users.total / this.pageSize()));
        this.userResponse.set(users);
        this.setUpSearch();
        this.isLoading.set(false);
      });
  }

  initSearchUserForm() {
    this.searchUserForm = this._fb.group({
      search: [''],
      role: [''],
    });
  }

  setUpSearch() {
    this.setUpSearchByCriteria('search');
    this.setUpSearchByCriteria('role');
  }

  setUpSearchByCriteria(field: string) {
    this.searchUserForm
      .get(field)!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          this.isLoading.set(true);

          let role: string = '';
          let fullNameOrEmail: string = '';
          if (field === 'role') {
            if (!value) {
              return this.userService.getAllUsers(
                this.currentPage(),
                this.pageSize()
              );
            } else {
              role = value;
              return this.userService.searchUserByRole(
                role,
                this.currentPage(),
                this.pageSize()
              );
            }
          } else if (field === 'search') {
            fullNameOrEmail = value;
            if (!fullNameOrEmail || fullNameOrEmail.trim().length === 0) {
              return this.userService.getAllUsers(
                this.currentPage(),
                this.pageSize()
              );
            }
            if (fullNameOrEmail.length >= 3) {
              const formattedValue = fullNameOrEmail
                .replace(/\s+/g, '-')
                .toLowerCase();
              return this.userService.searchUserByEmailOrFullname(
                formattedValue,
                this.currentPage(),
                this.pageSize()
              );
            }
          }
          return [];
        })
      )
      .subscribe((users) => {
        this.userResponse.update(() => users);
        this.isLoading.set(false);

        console.log('users: ', users);
      });
  }

  initResetPasswordForm() {
    this.resetPasswordForm = this._fb.group(
      {
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  resetPassword(userId: string) {
    console.log('Resetting password for user:', userId);
    this.selectedUserId = userId;
    this.resetPasswordForm.reset();
  }

  closeResetDrawer() {
    this.selectedUserId = '';
    this.resetPasswordForm.reset();
    this.resetPasswordDrawer()!.nativeElement.checked = false;
  }

  closeViewDrawer() {
    this.userBookings = [];
    this.viewBookingsDrawer()!.nativeElement.checked = false;
  }

  confirmResetPassword() {
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.get('password')?.value;
      // Call your API to reset password
      console.log('Resetting password for user:', this.selectedUserId);
      console.log('New password:', newPassword);

      this.authService
        .updateUserPassword(newPassword, this.selectedUserId)
        .subscribe(
          (response) => {
            console.log('Password reset successful:', response);
            this.showSuccessToast('Password reset successfully');
          },
          (error) => {
            console.error('Password reset failed:', error);
            this.showErrorToast('Failed to reset password. Please try again.');
          }
        );
      this.closeResetDrawer();
    }
  }

  editRoleUser(user: User) {
    // Implement edit user logic
  }

  showSuccessToast(message: string) {
    this.successMessages.push(message);
    setTimeout(() => {
      this.successMessages.pop();
    }, 3000);
  }

  showErrorToast(message: string) {
    this.errorMessages.push(message);
    setTimeout(() => {
      this.errorMessages.pop();
    }, 3000);
  }

  viewUserBookings(user_id: string) {
    console.log('Viewing bookings for user:', user_id);
    this.bookingService
      .getBookingByUserId(user_id)
      .pipe(
        tap((bookings) => {
          this.userBookings = bookings.map((booking: any) => {
            const date = booking.itinerary.legs[0].departure_time;
            const itinerary = `${booking.itinerary.legs[0].origin_name} - ${
              booking.itinerary.legs[booking.itinerary.legs.length - 1]
                .destination_name
            } `;
            return {
              booking_id: booking.booking_id,
              itinerary,
              itinerary_id: booking.itinerary.itinerary_id,
              no_passenger: booking.noPassengers,
              date,
              status: booking.status,
            };
          });
        })
      )
      .subscribe();
  }

  changePage(page: number) {
    this.currentPage.update(() => page);
    this.userService
      .getAllUsers(this.currentPage(), this.pageSize())
      .subscribe((users) => {
        console.log('page', this.currentPage());
        this.totalBookings.set(users.total);
        this.userResponse.set(users);
      });
  }

  getPagesArray(): number[] {
    return Array(this.totalBookings())
      .fill(0)
      .map((_, i) => i);
  }
}
