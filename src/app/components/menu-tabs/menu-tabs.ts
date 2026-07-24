import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { MenuService } from '../../services/api/menu';
import { FirstLetterUp } from '../../utils/helpers';
export interface MenuTab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-menu-tabs',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './menu-tabs.html',
  styleUrl: './menu-tabs.scss',
})
export class MenuTabs {
  constructor(public menuService: MenuService) {}
  @Input() tabs: MenuTab[] = [];
  @Input() activeTabId = '';
  @Output() tabSelected = new EventEmitter<string>();
  @Output() addMenu = new EventEmitter<void>();
  isAddTab = signal(false);
  @ViewChild('tabInput') tabInput!: ElementRef<HTMLInputElement>;

  onSaveNewTab(event: KeyboardEvent) {
    if (event?.key == 'Enter') {
      let valueStr = this.tabInput.nativeElement.value.trim().toString();
      if (valueStr.length > 1) {
        let newCategory = {
          id: valueStr.toLowerCase(),
          label: FirstLetterUp(valueStr),
        };
        this.menuService.addMenuTab(newCategory);
      }
      this.tabInput.nativeElement.value = '';
      this.isAddTab.set(false);
    }
  }

  onAddNewTab() {
    this.isAddTab.set(true);
    setTimeout(() => {
      this.tabInput.nativeElement.focus();
    });
  }
}
