import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupStateService } from '../../../services/signup.service';

@Component({
  selector: 'app-signup-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info.html',
  styleUrls: ['../select-sign-up/select-sign-up.scss'],
})
export class SignupPersonal implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(SignupStateService);

  form: FormGroup;
  isGoogle = false;

  constructor() {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/),
        ],
      ],
      country: [''],
    });
  }

  // ===== GETTERS (обязательно!) =====
  get fullNameInvalid(): boolean {
    const c = this.form.get('fullName');
    return !!c && c.invalid && c.touched;
  }
  get emailInvalid(): boolean {
    const c = this.form.get('email');
    return !!c && c.invalid && c.touched;
  }
  get passwordInvalid(): boolean {
    const c = this.form.get('password');
    return !!c && c.invalid && c.touched;
  }

  ngOnInit(): void {
    this.isGoogle = this.stateService.getAuthMethod() === 'google';
    if (this.isGoogle) {
      this.router.navigate(['/sign-up/company']);
      return;
    }
    const saved = this.stateService.getPersonal();
    if (saved) this.form.patchValue(saved);
  }

  continue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.stateService.setPersonal(this.form.value);
    this.router.navigate(['/sign-up/company']);
  }
}
