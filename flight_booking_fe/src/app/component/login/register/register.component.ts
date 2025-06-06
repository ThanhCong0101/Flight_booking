import { Component, OnInit, output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  filter,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { EMAIL_PATTERN, PASSWORD_PATTERN } from 'src/app/util/auth';
import { UserModel } from 'src/app/models/user.model';
import { userService } from 'src/app/services/user.service';
import { validateForm } from 'src/app/util/validation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  formSubmit$ = new Subject<any>();
  registerForm!: FormGroup;
  destroy$ = new Subject<void>();

  isAuthChanged = output<boolean>();

  constructor(private _fb: FormBuilder, private userService: userService) {}

  ngOnInit() {
    this.initForm();

    this.formSubmit$
      .pipe(
        tap(() => this.registerForm.markAsDirty()),
        switchMap(() => validateForm(this.registerForm)),
        filter((isValid) => isValid),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.submitForm());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm() {
    console.log('Submit form');

    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    const newUser: UserModel = {
      email,
      password,
    };

    this.userService.register(newUser).subscribe(() => {
      this.isAuthChanged.emit(true);
    });
  }

  initForm() {
    this.registerForm = this._fb.group(
      {
        email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.pattern(EMAIL_PATTERN),
          ]),
          this.validateEmailFromAPIDebounce.bind(this),
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(PASSWORD_PATTERN),
          ]),
        ],
        confirmPassword: [
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

  validateEmailFromAPIDebounce(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return timer(300).pipe(
      switchMap(() => {
        console.log(control.value);
        return this.userService.validateEmail(control.value).pipe(
          map((isValid) => {
            if (isValid) {
              return {
                emailDuplicated: true,
              };
            }
            return null;
          })
        );
      })
    );
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['minlength']) {
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return 'Invalid format';
      }
      if (control.errors['emailDuplicated']) {
        return 'Email is already taken';
      }
      if (
        controlName === 'confirmPassword' &&
        control.errors['valueNotMatch']
      ) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}
