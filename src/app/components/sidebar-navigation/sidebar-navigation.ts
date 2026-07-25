import { Component, inject, signal } from '@angular/core';
import { NavProfileCard } from '../nav-profile-card/nav-profile-card';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuService } from '../../services/api/menu';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar-navigation',
  imports: [NavProfileCard, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './sidebar-navigation.html',
  styleUrl: './sidebar-navigation.scss',
})
export class SidebarNavigation {
  menuService = inject(MenuService);

  isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
