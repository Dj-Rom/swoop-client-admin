import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignupStateService } from '../../../services/signup.service';
import { SwoopValidators } from '../../../validators';

@Component({
  selector: 'app-signup-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-info.html',
  styleUrls: ['../select-sign-up/select-sign-up.scss'],
})
export class SignupCompany {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(SignupStateService);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      placeName: ['', [Validators.required, Validators.maxLength(250)]],
      nip: ['', [SwoopValidators.nip]],
      regon: ['', [SwoopValidators.regon]],
      krs: ['', [SwoopValidators.krs]],
      address: ['', [Validators.maxLength(250)]],
      city: ['', [Validators.maxLength(200)]],
      postalCode: ['', [SwoopValidators.postalCode]],
      website: [''],
    });

    const saved = this.stateService.getCompany();
    if (saved) this.form.patchValue(saved);
  }

  get placeNameInvalid() {
    return this.isInvalid('placeName');
  }
  private isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!c && c.invalid && c.touched;
  }

  back(): void {
    this.router.navigate(['/signup/personal']);
  }

  continue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.stateService.setCompany(this.form.value);
    this.router.navigate(['/sign-up/contact']);
  }
}
