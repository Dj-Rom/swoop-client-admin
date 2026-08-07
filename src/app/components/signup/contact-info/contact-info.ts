// ============================================
// SIGNUP-CONTACT (финальный шаг — отправка)
// ============================================
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupStateService } from '../../../services/signup.service';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'app-signup-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-info.html',
  styleUrls: ['../select-sign-up/select-sign-up.scss'],
})
export class SignupContact {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(SignupStateService);
  private authService = inject(AuthService);

  form: FormGroup;
  submitting = false;
  submitError = '';
  submitSuccess = ''; // ← обязательно!

  constructor() {
    this.form = this.fb.group({
      companyEmail: ['', [Validators.email]],
      contactNumber: [''],
      acceptTerms: [false, [Validators.requiredTrue]],
    });
  }

  // ===== GETTER (обязательно!) =====
  get companyEmailInvalid(): boolean {
    const c = this.form.get('companyEmail');
    return !!c && c.invalid && c.touched;
  }

  back(): void {
    this.router.navigate(['/sign-up/company']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = '';

    const personal = this.stateService.getPersonal();
    const company = this.stateService.getCompany();
    const contact = this.form.value;
    const authMethod = this.stateService.getAuthMethod();

    if (authMethod === 'google') {
      // Google регистрация
      const googleToken = this.stateService.getGoogleToken();

      this.authService
        .googleSignUp(googleToken!, {
          companyName: company?.placeName,
          nip: company?.nip,
          regon: company?.regon,
          krs: company?.krs,
          addressFull: company?.address,
          city: company?.city,
          postalCode: company?.postalCode,
          website: company?.website,
          companyEmail: contact.companyEmail,
          companyPhone: contact.contactNumber,
        })
        .subscribe({
          next: (res) => {
            console.log('[Signup] Google success:', res);
            this.stateService.clear();
            this.router.navigate(['/menu/structure']);
          },
          error: (err) => {
            console.error('[Signup] Google failed:', err);
            this.submitError = err.error?.message || 'Registration failed.';
            this.submitting = false;
          },
        });
    } else {
      // Email регистрация
      const payload = {
        email: personal?.email,
        password: personal?.password,
        fullName: personal?.fullName,
        phone: personal?.phone,
        companyName: company?.placeName,
        nip: company?.nip,
        regon: company?.regon,
        krs: company?.krs,
        addressFull: company?.address,
        city: company?.city,
        postalCode: company?.postalCode,
        website: company?.website,
        companyEmail: contact.companyEmail,
        companyPhone: contact.contactNumber,
      };

      this.authService.register(payload).subscribe({
        next: (res) => {
          console.log('[Signup] Success:', res);
          this.stateService.clear();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('[Signup] Failed:', err);
          this.submitError = err.error?.message || 'Registration failed.';
          this.submitting = false;
        },
      });
    }
  }
}
