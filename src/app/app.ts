// app.ts
import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth/auth-service';
import { GlobalLoaderComponent } from './components/global-loader/global-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('SwoopAdmin');

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // ✅ Effect to watch for authentication changes
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      const currentUrl = this.router.url;

      console.log('[App] Auth state changed:', isAuth);
      console.log('[App] Current URL:', currentUrl);

      // If authenticated and on login or sign-up page, redirect to menu
      if (
        isAuth &&
        (currentUrl.includes('/login') || currentUrl.includes('/sign-up') || currentUrl === '/')
      ) {
        console.log('[App] Redirecting from login to menu');
        this.router
          .navigate(['/menu/structure'])
          .then((success) => {
            console.log('[App] Redirect success:', success);
          })
          .catch((err) => {
            console.error('[App] Redirect error:', err);
          });
      }
    });
  }

  ngOnInit(): void {
    // ✅ Check if already authenticated on startup
    const isAuth = this.authService.isAuthenticated();
    const currentUrl = this.router.url;

    console.log('[App] OnInit - isAuthenticated:', isAuth);
    console.log('[App] OnInit - Current URL:', currentUrl);
    console.log('[App] OnInit - User:', this.authService.user());
    console.log(
      '[App] OnInit - Token:',
      this.authService.getAccessToken()?.substring(0, 20) + '...',
    );

    if (
      isAuth &&
      (currentUrl.includes('/login') || currentUrl.includes('/sign-up') || currentUrl === '/')
    ) {
      console.log('[App] OnInit - Already authenticated, redirecting to menu');
      this.router.navigate(['/menu/structure']);
    }
  }
}
