// ============================================
// SIGNUP-STATE SERVICE (обновлённый)
// ============================================
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SignupStateService {
  private personal: any = null;
  private company: any = null;
  private authMethod: 'email' | 'google' = 'email';
  private googleToken: string | null = null;

  setAuthMethod(method: 'email' | 'google'): void {
    this.authMethod = method;
  }
  getAuthMethod(): 'email' | 'google' {
    return this.authMethod;
  }

  setGoogleToken(token: string): void {
    this.googleToken = token;
  }
  getGoogleToken(): string | null {
    return this.googleToken;
  }

  setPersonal(data: any): void {
    this.personal = { ...this.personal, ...data };
  }
  getPersonal(): any {
    return this.personal;
  }

  setCompany(data: any): void {
    this.company = data;
  }
  getCompany(): any {
    return this.company;
  }

  // Проверка: готовы ли все данные
  isComplete(): boolean {
    if (this.authMethod === 'google') {
      return !!this.personal && !!this.company;
    }
    return !!this.personal && !!this.company;
  }

  clear(): void {
    this.personal = null;
    this.company = null;
    this.googleToken = null;
    this.authMethod = 'email';
  }
}
