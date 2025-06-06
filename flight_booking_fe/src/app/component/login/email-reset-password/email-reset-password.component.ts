import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { EMAIL_PATTERN } from 'src/app/util/auth';
import { validateForm } from 'src/app/util/validation';

@Component({
  selector: 'app-email-reset-password',
  templateUrl: './email-reset-password.component.html',
  styleUrls: ['./email-reset-password.component.css'],
})
export class EmailResetPasswordComponent implements OnInit {
  formSubmit$ = new Subject<any>();
  emailResetPasswordForm!: FormGroup;
  destroy$ = new Subject<void>();

  successMessages: string[] = [];
  errorMessages: string[] = [];

  constructor(
    private _fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.formSubmit$
      .pipe(
        tap(() => this.emailResetPasswordForm.markAsDirty()),
        switchMap(() => validateForm(this.emailResetPasswordForm)),
        filter((isValid) => isValid),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.submitForm());
  }

  initForm() {
    this.emailResetPasswordForm = this._fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(EMAIL_PATTERN),
          Validators.maxLength(50),
        ],
      ],
    });
  }

  submitForm() {
    console.log('Submit form');
    const email = this.emailResetPasswordForm.value.email;

    this.authService.sendEmailResetPassword(email).subscribe(
      (response) => {
        if (response.status === 200) {
          console.log('Success:', response.message);
          // Show the success notification.
          this.showSuccessToast('Email sent successfully');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.showErrorToast('Failed to send email. Please try again.');
      }
    );
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
}
