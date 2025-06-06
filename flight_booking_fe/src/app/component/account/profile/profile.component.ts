import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, map, pipe, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AccountPageService } from 'src/app/services/account-page.service';
import { AuthService } from 'src/app/services/auth.service';
import { TokenService } from 'src/app/services/token.service';
import { userService } from 'src/app/services/user.service';
import { validateForm } from 'src/app/util/validation';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  isEditing: boolean = false;

  passwordForm!: FormGroup;
  formSubmit$ = new Subject<any>();
  destroy$ = new Subject<void>();

  userForm!: FormGroup;
  data: any;
  dataEmail: string = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: userService,
    private accountPageService: AccountPageService
  ) {}

  ngOnInit(): void {
    this.initPasswordForm();
    this.initUserForm();
    this.getUserProfile();

    this.formSubmit$
      .pipe(
        tap(() => this.userForm.markAsDirty()),
        switchMap(() => validateForm(this.userForm)),
        filter((isValid) => {
          console.log(isValid);
          return isValid;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.saveChanges());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  patchUserForm(userData: any) {
    this.userForm.patchValue({
      firstName: userData[0].first_name,
      lastName: userData[0].last_name,
      dateOfBirth: new Date(userData[0].date_of_birth)
        .toISOString()
        .split('T')[0],
      gender: userData[0].gender,
      email: userData[0].email,
      phoneNumber: userData[0].phone_number,
      passportNumber: userData[0].passport_number,
      passportExpiry: userData[0].passport_expiry,
      nationality: userData[0].nationality,
      streetAddress: userData[0].street_address,
      city: userData[0].city,
      country: userData[0].country,
      postalCode: userData[0].postal_code,
    });
  }

  initUserForm() {
    this.userForm = this.fb.group({
      // Personal Information
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      dateOfBirth: [{ value: '', disabled: true }],
      gender: [{ value: 'male', disabled: true }],
      email: [{ value: '', disabled: true }],
      phoneNumber: [{ value: '', disabled: true }],

      // Travel Document
      passportNumber: [{ value: 'AB123456', disabled: true }],
      passportExpiry: [{ value: '2025-12-31', disabled: true }],
      nationality: [{ value: 'United States', disabled: true }],

      // Contact Information
      streetAddress: [{ value: '123 Main Street', disabled: true }],
      city: [{ value: 'New York', disabled: true }],
      country: [{ value: 'United States', disabled: true }],
      postalCode: [{ value: '10001', disabled: true }],
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userForm.enable();
    } else {
      this.userForm.disable();
      this.saveChanges();
    }
  }

  saveChanges() {
    console.log('submit form');

    const email = this.userForm.get('email')?.value;

    const dirtyControls = Object.keys(this.userForm.controls)
      .filter((key) => this.userForm.get(key)?.dirty)
      .reduce((acc: any, key) => {
        // Convert form control names to backend field names
        const backendFieldName = this.getBackendFieldName(key);
        acc[backendFieldName] = this.userForm.get(key)?.value;
        return acc;
      }, {});

    if (Object.keys(dirtyControls).length > 0) {
      console.log(this.dataEmail);
      this.userService
        .updateUser(email, dirtyControls)
        .subscribe((userData) => {
          console.log(dirtyControls);
          console.log(userData);
        });
    }
  }

  private getBackendFieldName(controlName: string): string {
    return controlName.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
  }

  getUserProfile() {
    this.accountPageService.sharedData$
      .pipe(
        map((data) => {
          this.dataEmail = data.email;
          return data.email;
        }),
        switchMap((email) => {
          return this.userService.getUserByEmail(email).pipe(
            tap((user) => {
              this.patchUserForm(user);
            })
          );
        })
      )
      .subscribe();
  }

  initPasswordForm() {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        verificationCode: ['', Validators.required],
      },
      {
        validator: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  sendVerificationCode() {
    // Implement verification code sending logic
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      // Implement password update logic
    }
  }
}
