import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserService, User, UpdateUserPayload } from '../../services/user.service';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  userService = inject(UserService);
  authService = inject(AuthService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  successMessage: string | null = null;

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      phone: [''],
      company: [''],
      address: [''],
    });

    // ✅ Fixed: Password form with custom validator
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordsMatchValidator, // ✅ Use the validator method
      },
    );
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  // ===== PASSWORD MATCH VALIDATOR =====
  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { mismatch: true };
    }
    return null;
  }

  // ===== GETTERS =====
  get newPasswordInvalid(): boolean {
    const c = this.passwordForm.get('newPassword');
    return !!c && c.invalid && c.touched;
  }

  get passwordMismatch(): boolean {
    const confirmControl = this.passwordForm.get('confirmPassword');
    return !!this.passwordForm.errors?.['mismatch'] && !!confirmControl?.touched;
  }

  get currentPasswordInvalid(): boolean {
    const c = this.passwordForm.get('currentPassword');
    return !!c && c.invalid && c.touched;
  }

  // ===== LOAD USER DATA =====
  loadUserData(): void {
    const currentUser = this.userService.currentUser();
    if (currentUser) {
      console.log('[UserProfile] Using cached user data:', currentUser);
      this.patchForm(currentUser);
    } else {
      const authUser = this.authService.user();
      if (authUser) {
        console.log('[UserProfile] Using auth user data:', authUser);
        this.patchForm(authUser as User);
      }
    }

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('[UserProfile] Fresh data loaded:', user);
        this.patchForm(user);
        this.successMessage = null;
      },
      error: (error) => {
        console.warn('[UserProfile] Could not fetch fresh data, using cached data');
      },
    });
  }

  patchForm(user: User): void {
    this.profileForm.patchValue({
      fullName: user.fullName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      company: user.company || '',
      address: user.address || '',
    });
  }

  retryLoadUser(): void {
    this.successMessage = null;
    this.loadUserData();
  }

  resetForm(): void {
    const currentUser = this.userService.currentUser();
    if (currentUser) {
      this.patchForm(currentUser);
    }
    this.successMessage = null;
  }

  // components/user-profile/user-profile.component.ts
  // ... existing code ...

  // ===== AVATAR UPLOAD =====
  triggerFileUpload(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.successMessage = 'Please select an image file';
        setTimeout(() => (this.successMessage = null), 3000);
        input.value = '';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.successMessage = 'Image size must be less than 5MB';
        setTimeout(() => (this.successMessage = null), 3000);
        input.value = '';
        return;
      }

      // Show uploading message
      this.successMessage = 'Uploading avatar...';

      this.userService.uploadAvatar(file).subscribe({
        next: (response) => {
          console.log('[UserProfile] Avatar uploaded:', response);
          this.successMessage = 'Avatar updated successfully!';
          setTimeout(() => (this.successMessage = null), 3000);
        },
        error: (error) => {
          console.error('[UserProfile] Failed to upload avatar:', error);
          // Show user-friendly error message
          if (error.status === 404) {
            this.successMessage = 'Avatar upload is not available. Please contact support.';
          } else {
            this.successMessage = error.message || 'Failed to upload avatar. Please try again.';
          }
          setTimeout(() => (this.successMessage = null), 4000);
        },
      });
    }
    // Reset input
    input.value = '';
  }

  handleImageError(): void {
    console.log('[UserProfile] Avatar image failed to load, using initials');
    // The service will handle this by showing initials
  }

  // ... rest of the code ...

  // ===== PROFILE UPDATE =====
  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.successMessage = null;
    const payload: UpdateUserPayload = this.profileForm.value;

    this.userService.updateProfile(payload).subscribe({
      next: () => {
        console.log('[UserProfile] Profile updated successfully');
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (error) => {
        console.error('[UserProfile] Failed to update profile:', error);
        this.successMessage = 'Failed to update profile. Please try again.';
        setTimeout(() => (this.successMessage = null), 3000);
      },
    });
  }

  // ===== PASSWORD CHANGE =====
  changePassword(): void {
    // ✅ Check if form is valid before submitting
    if (this.passwordForm.invalid) {
      // Mark all fields as touched to show errors
      Object.keys(this.passwordForm.controls).forEach((key) => {
        const control = this.passwordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.successMessage = null;
    const payload = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
      confirmPassword: this.passwordForm.get('confirmPassword')?.value,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        console.log('[UserProfile] Password changed successfully');
        this.successMessage = 'Password changed successfully!';
        this.passwordForm.reset();
        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;
        // Clear validation errors after reset
        Object.keys(this.passwordForm.controls).forEach((key) => {
          const control = this.passwordForm.get(key);
          control?.markAsPristine();
          control?.markAsUntouched();
        });
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (error) => {
        console.error('[UserProfile] Failed to change password:', error);
        this.successMessage =
          error.error?.message || 'Failed to change password. Please try again.';
        setTimeout(() => (this.successMessage = null), 3000);
      },
    });
  }

  // ===== PASSWORD VISIBILITY TOGGLES =====
  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ===== PASSWORD STRENGTH =====
  getPasswordStrength(): number {
    const password = this.passwordForm.get('newPassword')?.value || '';
    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 10) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    return Math.min(strength, 100);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 20) return 'Very Weak';
    if (strength < 40) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  }

  getStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength < 20) return '#fc8181';
    if (strength < 40) return '#ed8936';
    if (strength < 60) return '#ecc94b';
    if (strength < 80) return '#48bb78';
    return '#38a169';
  }

  // ===== LOGOUT =====
  logout(): void {
    this.authService.logout();
  }
}
