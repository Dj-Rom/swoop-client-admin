// validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class SwoopValidators {
  static nip(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // optional
      if (!/^\d{10}$/.test(value)) return { nip: 'NIP must be 10 digits' };
      return null;
    };
  }

  static regon(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      if (!/^\d{9}$|^\d{14}$/.test(value)) return { regon: 'REGON must be 9 or 14 digits' };
      return null;
    };
  }

  static krs(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      if (!/^\d{10}$/.test(value)) return { krs: 'KRS must be 10 digits' };
      return null;
    };
  }

  static postalCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      if (!/^\d{2}-\d{3}$/.test(value)) return { postalCode: 'Format: XX-XXX (e.g. 61-474)' };
      return null;
    };
  }

  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      if (!/^\+?\d{7,15}$/.test(value)) return { phone: 'Invalid phone number' };
      return null;
    };
  }

  static companyName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      if (value.length > 255) return { maxlength: 'Max 255 characters' };
      return null;
    };
  }
}
