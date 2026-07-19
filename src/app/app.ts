import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavigation } from '../app/components/sidebar-navigation/sidebar-navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarNavigation],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('SwoopAdmin');
}
