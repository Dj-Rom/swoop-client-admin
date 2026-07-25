import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
  inject,
} from '@angular/core';

import { MenuService } from '../../services/api/menu';
import { FirstLetterUp } from '../../utils/helpers';
import { Menu } from '../../models/menu.model';

@Component({
  selector: 'app-menu-tabs',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './menu-tabs.html',
  styleUrl: './menu-tabs.scss',
})
export class MenuTabs {
  private menuService = inject(MenuService);

  @Input() tabs: Menu[] = [];

  @Input() activeTabId = '';

  @Output() tabSelected = new EventEmitter<string>();

  isAddTab = signal(false);

  @ViewChild('tabInput')
  tabInput!: ElementRef<HTMLInputElement>;

  selectTab(id: string) {
    this.tabSelected.emit(id);
  }

  onSaveNewTab(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      return;
    }

    const value = this.tabInput.nativeElement.value.trim();

    if (value.length > 1) {
      const newMenu: Menu = {
        id: value.toLowerCase().replaceAll(' ', '-'),

        name: FirstLetterUp(value),

        description: `${FirstLetterUp(value)} menu`,

        active: true,

        dateCreated: new Date().toISOString(),
      };

      this.menuService.addMenu(newMenu);
    }

    this.tabInput.nativeElement.value = '';

    this.isAddTab.set(false);
  }

  onAddNewTab() {
    this.isAddTab.set(true);

    setTimeout(() => {
      this.tabInput?.nativeElement.focus();
    });
  }
}
