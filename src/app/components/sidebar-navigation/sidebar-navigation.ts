import { Component } from '@angular/core';
import { NavProfileCard } from '../nav-profile-card/nav-profile-card';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-sidebar-navigation',
  imports: [NavProfileCard, RouterLink],
  templateUrl: './sidebar-navigation.html',
  styleUrl: './sidebar-navigation.scss',
})
export class SidebarNavigation {}
