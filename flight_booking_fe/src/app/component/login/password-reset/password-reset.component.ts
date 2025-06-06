import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { userService } from 'src/app/services/user.service';
import { EMAIL_PATTERN, PASSWORD_PATTERN } from 'src/app/util/auth';
import { validateForm } from 'src/app/util/validation';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  formSubmit$ = new Subject<any>();
  passwordResetForm!: FormGroup;
  destroy$ = new Subject<void>();
  email$ = '';
  tempAccessToken = '';

  constructor(
    private _fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.validate_token();

    this.initForm();

    this.formSubmit$
      .pipe(
        tap(() => this.passwordResetForm.markAsDirty()),
        switchMap(() => validateForm(this.passwordResetForm)),
        filter((isValid) => isValid),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.submitForm());
  }

  validate_token(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      this.email$ = params['email'];

      if (token && this.email$) {
        this.authService.validateToken(token).subscribe(
          (response) => {
            console.log(response);
            this.tempAccessToken = response.tempAccessToken;
          },
          (error) => {
            console.error('Token is invalid');
            // Navigate to not-found page
            this.router.navigate(['/**']);
          }
        );
      } else {
        this.router.navigate(['/**']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    console.log('Submit form');

    const password = this.passwordResetForm.value.newPassword;

    this.authService.resetPassword(this.tempAccessToken, password).subscribe(
      (response) => {
        if (response.user) {
          console.log('Password reset successfully');
          this.router.navigate(['/login']);
        }
      },
      (error) => {
        console.error('Error resetting password:', error);
      }
    );
  }

  initForm() {
    this.passwordResetForm = this._fb.group(
      {
        newPassword: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(PASSWORD_PATTERN),
          ]),
        ],
        confirmNewPassword: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(PASSWORD_PATTERN),
          ]),
        ],
      },
      {
        validators: this.validateControlsValue('password', 'confirmPassword'),
      }
    );
  }

  validateControlsValue(firstControlName: string, secondControlName: string) {
    return function (formGroup: FormGroup) {
      const firstControl = formGroup.get(firstControlName);
      const secondControl = formGroup.get(secondControlName);
      const firstControlValue = firstControl?.value;
      const secondControlValue = secondControl?.value;
      return firstControlValue === secondControlValue
        ? null
        : {
            valueNotMatch: {
              firstControlValue,
              secondControlValue,
            },
          };
    };
  }

  getErrorMessage(controlName: string): string {
    const control = this.passwordResetForm.get(controlName);
    if (control?.errors) {
      if (control.hasError('required')) {
        return 'This field is required';
      }
      if (control.hasError('minlength')) {
        return 'Password must be at least 6 characters long';
      }
      if (control.hasError('pattern')) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character';
      }
      if (control.hasError('valueNotMatch')) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}
