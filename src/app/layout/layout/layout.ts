import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth-service';
import { SidebarNavigation } from '../../components/sidebar-navigation/sidebar-navigation';

interface NavItem {
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarNavigation],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class Layout {
  /** Controls the collapsed/mobile state of the sidebar. */
  sidebarOpen = signal(false);

  readonly navSections: NavSection[] = [
    {
      title: 'Menu',
      items: [
        { label: 'Structure', path: '/menu/structure' },
        { label: 'Stop List', path: '/menu/stop-list' },
        { label: 'Diets & Allergens', path: '/menu/diets-and-allergens' },
      ],
    },
    {
      title: 'About Us',
      items: [
        { label: 'Welcome Page', path: '/about-us/welcome-page' },
        { label: 'Staff', path: '/about-us/staff' },
      ],
    },
    {
      title: 'Orders',
      items: [
        { label: 'Today', path: '/orders/today' },
        { label: 'History', path: '/orders/history' },
        { label: 'Analytics', path: '/orders/analitics' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'Language', path: '/settings/language' },
        { label: 'Profile', path: '/settings/profile' },
      ],
    },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
