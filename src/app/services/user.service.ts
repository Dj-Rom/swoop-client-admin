// services/user/user.service.ts
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { AuthService } from './auth/auth-service';
import { environment } from '../../environments/environment'; // ← добавлено

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clientId?: string;
  avatarUrl?: string;
  picture?: string;
  googleId?: string;
  emailVerified?: boolean;
  provider?: 'email' | 'google';
  phone?: string;
  address?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  company?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl; // ← теперь из окружения

  // Private signals
  private currentUserSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public computed signals
  currentUser = computed(() => this.currentUserSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());

  // User properties as computed signals
  userName = computed(() => {
    const user = this.currentUserSignal();
    if (!user) return 'Guest';
    return user.fullName || user.firstName || user.email || 'User';
  });

  userEmail = computed(() => {
    const user = this.currentUserSignal();
    return user?.email || '';
  });

  userAvatar = computed(() => {
    const user = this.currentUserSignal();
    return user?.avatarUrl || user?.picture || null;
  });

  userInitials = computed(() => {
    const user = this.currentUserSignal();
    if (!user) return '?';

    if (user.fullName) {
      const parts = user.fullName.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }

    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }

    if (user.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return 'U';
  });

  userRole = computed(() => {
    const user = this.currentUserSignal();
    return user?.role || 'user';
  });

  userFullName = computed(() => {
    const user = this.currentUserSignal();
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    return user?.email || 'User';
  });

  userDisplayName = computed(() => {
    const user = this.currentUserSignal();
    if (user?.fullName) return user.fullName;
    if (user?.firstName) return user.firstName;
    return user?.email?.split('@')[0] || 'User';
  });

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  isAdmin = computed(() => this.userRole() === 'admin');
  isManager = computed(() => this.userRole() === 'client' || this.userRole() === 'admin');

  constructor() {
    // React to auth user changes
    effect(() => {
      const user = this.authService.user();
      console.log('[UserService] Auth user changed:', user);

      if (user) {
        this.currentUserSignal.set(user as User);
        this.errorSignal.set(null);
        this.tryFetchUserData();
      } else {
        this.currentUserSignal.set(null);
      }
    });

    // Initialize if user already logged in
    if (this.authService.isAuthenticated()) {
      const user = this.authService.user();
      if (user) {
        this.currentUserSignal.set(user as User);
        this.tryFetchUserData();
      }
    }
  }

  // ===== TRY FETCH USER DATA (silent fail) =====
  private tryFetchUserData(): void {
    this.getCurrentUser().subscribe({
      next: (user) => {
        console.log('[UserService] Fresh user data loaded:', user);
        this.currentUserSignal.set(user);
        this.errorSignal.set(null);
      },
      error: () => {
        // Silent fail - we already have user data from auth
        if (!this.currentUserSignal()) {
          this.errorSignal.set('Could not load user profile');
        }
      },
    });
  }

  // ===== GET CURRENT USER =====
  getCurrentUser(): Observable<User> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
      tap({
        next: (user) => {
          console.log('[UserService] Current user loaded from API:', user);
          this.currentUserSignal.set(user);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error: HttpErrorResponse) => {
          console.warn('[UserService] API failed, using auth data as fallback');
          this.loadingSignal.set(false);

          const authUser = this.authService.user();
          if (authUser) {
            this.currentUserSignal.set(authUser as User);
            this.errorSignal.set(null);
            console.log('[UserService] Using auth user data as fallback:', authUser);
          } else {
            this.errorSignal.set('Could not load user profile');
          }
        },
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSignal.set(false);
        const authUser = this.authService.user();
        if (authUser) {
          console.log('[UserService] Returning auth user data as fallback');
          return of(authUser as User);
        }
        return throwError(() => error);
      }),
    );
  }

  // ===== UPDATE USER PROFILE =====
  updateProfile(payload: UpdateUserPayload): Observable<User> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Update locally first
    const currentUser = this.currentUserSignal();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        ...payload,
      };
      this.currentUserSignal.set(updatedUser);
    }

    return this.http.put<User>(`${this.apiUrl}/users/profile`, payload).pipe(
      tap({
        next: (user) => {
          console.log('[UserService] Profile updated on server:', user);
          this.currentUserSignal.set(user);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[UserService] Failed to update profile on server:', error);
          this.errorSignal.set('Profile updated locally but failed to save on server');
          this.loadingSignal.set(false);
        },
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        const currentUser = this.currentUserSignal();
        if (currentUser) {
          return of(currentUser);
        }
        return throwError(() => error);
      }),
    );
  }

  // ===== CHANGE PASSWORD =====
  changePassword(payload: ChangePasswordPayload): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post(`${this.apiUrl}/users/change-password`, payload).pipe(
      tap({
        next: (response) => {
          console.log('[UserService] Password changed successfully');
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[UserService] Failed to change password:', error);
          this.errorSignal.set(error.error?.message || 'Failed to change password');
          this.loadingSignal.set(false);
        },
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      }),
    );
  }

  // ===== UPLOAD AVATAR =====
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/users/avatar`, formData).pipe(
      tap({
        next: (response) => {
          console.log('[UserService] Avatar uploaded:', response.avatarUrl);

          const currentUser = this.currentUserSignal();
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              avatarUrl: response.avatarUrl,
              picture: response.avatarUrl,
            };
            this.currentUserSignal.set(updatedUser);
          }

          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[UserService] Failed to upload avatar:', error);

          // Handle 404 - endpoint doesn't exist
          if (error.status === 404) {
            this.errorSignal.set('Avatar upload is not available yet. Please check back later.');
          } else if (error.status === 413) {
            this.errorSignal.set('File is too large. Please upload an image smaller than 5MB.');
          } else if (error.status === 415) {
            this.errorSignal.set('Invalid file type. Please upload an image (JPEG, PNG, GIF).');
          } else {
            this.errorSignal.set(
              error.error?.message || 'Failed to upload avatar. Please try again.',
            );
          }

          this.loadingSignal.set(false);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        this.loadingSignal.set(false);

        // Return a fallback observable with a user-friendly error
        return throwError(() => ({
          status: error.status,
          message:
            error.status === 404
              ? 'Avatar upload is not available yet.'
              : 'Failed to upload avatar. Please try again.',
        }));
      }),
    );
  }

  // ===== GET USER BY ID =====
  getUserById(id: string): Observable<User> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      tap({
        next: (user) => {
          console.log('[UserService] User loaded:', user.id);
          this.loadingSignal.set(false);
          this.errorSignal.set(null);
        },
        error: (error: HttpErrorResponse) => {
          console.error('[UserService] Failed to load user:', error);
          this.errorSignal.set(error.error?.message || 'Failed to load user');
          this.loadingSignal.set(false);
        },
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      }),
    );
  }

  // ===== CLEAR USER DATA =====
  clearUserData(): void {
    this.currentUserSignal.set(null);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  // ===== RELOAD USER DATA =====
  refreshUser(): void {
    if (this.authService.isAuthenticated()) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          console.log('[UserService] User refreshed:', user);
        },
        error: () => {
          console.warn('[UserService] Refresh failed, using cached data');
        },
      });
    }
  }

  // ===== GET USER NAME WITH FALLBACK =====
  getUserName(user?: User): string {
    if (user) {
      return user.fullName || user.firstName || user.email || 'Unknown User';
    }
    return this.userName();
  }

  // ===== GET USER AVATAR WITH FALLBACK =====
  getUserAvatar(user?: User): string | null {
    if (user) {
      return user.avatarUrl || user.picture || null;
    }
    return this.userAvatar();
  }

  // ===== GET USER INITIALS =====
  getUserInitials(user?: User): string {
    if (user) {
      if (user.fullName) {
        const parts = user.fullName.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.fullName.substring(0, 2).toUpperCase();
      }
      if (user.firstName && user.lastName) {
        return (user.firstName[0] + user.lastName[0]).toUpperCase();
      }
      if (user.firstName) {
        return user.firstName.substring(0, 2).toUpperCase();
      }
      return user.email?.substring(0, 2).toUpperCase() || 'U';
    }
    return this.userInitials();
  }

  // ===== GET USER ID =====
  getUserId(): string | null {
    return this.currentUserSignal()?.id || null;
  }

  // ===== GET CLIENT ID =====
  getClientId(): string | null {
    return this.currentUserSignal()?.clientId || null;
  }

  // ===== CHECK IF USER HAS ROLE =====
  hasRole(role: string | string[]): boolean {
    const userRole = this.userRole();
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  }
}
