import { Component, signal } from '@angular/core';
import { NavProfileCard } from '../nav-profile-card/nav-profile-card';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-navigation',
  imports: [NavProfileCard, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-navigation.html',
  styleUrl: './sidebar-navigation.scss',
})
export class SidebarNavigation {
  isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
