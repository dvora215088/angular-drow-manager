// login.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('scaleIn', [
      state('void', style({ transform: 'scale(0)' })),
      transition(':enter', [
        animate('400ms 1000ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideDown', [
      state('void', style({ transform: 'translateY(-20px)', opacity: 0 })),
      transition(':enter', [
        animate('800ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;
  
  // כהה לבהיר - הצבעים המרכזיים של האפליקציה
  colors = {
    primary: '#3498db',      // כחול בינוני
    primaryLight: '#60a5fa', // כחול בהיר
    primaryDark: '#2874a6',  // כחול כהה
    secondary: '#7f8c8d',    // כחול פלדה
    textPrimary: '#34495e',  // כחול כהה עבור טקסט
    textSecondary: '#5d768a' // כחול-אפור עבור טקסט משני
  };


  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {
    // אפשר להוסיף קוד אתחול נוסף כאן
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.loginAsAdmin(email, password).subscribe(
      (response: { token: string }) => {
        localStorage.setItem("token", response.token);

        this.isLoading = false;
        this.successMessage = 'התחברת בהצלחה!';
        this.snackBar.open('התחברת בהצלחה!', 'סגור', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'התחברות נכשלה; בדוק את פרטי ההתחברות.';
        this.snackBar.open('התחברות נכשלה', 'סגור', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  getErrorMessage(control: string): string {
    if (control === 'email') {
      if (this.loginForm.get('email')?.hasError('required')) {
        return 'אנא הזן כתובת אימייל';
      }
      return this.loginForm.get('email')?.hasError('email') ? 'כתובת אימייל לא תקינה' : '';
    } else if (control === 'password') {
      if (this.loginForm.get('password')?.hasError('required')) {
        return 'אנא הזן סיסמה';
      }
      return this.loginForm.get('password')?.hasError('minlength') ? 'סיסמה חייבת להכיל לפחות 6 תווים' : '';
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}