import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface MenuTab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-menu-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-tabs.html',
  styleUrl: './menu-tabs.scss',
})
export class MenuTabs {
  @Input() tabs: MenuTab[] = [];
  @Input() activeTabId = '';
  @Output() tabSelected = new EventEmitter<string>();
  @Output() addMenu = new EventEmitter<void>();
}
