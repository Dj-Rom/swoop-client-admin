// components/menu-tabs/menu-tabs.ts
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
import { MenuTabItem } from '../../models/menu.model';
import { SpinnerComponent } from '../spinner/spinner';

@Component({
  selector: 'app-menu-tabs',
  standalone: true,
  imports: [CommonModule, NgIf, SpinnerComponent],
  templateUrl: './menu-tabs.html',
  styleUrl: './menu-tabs.scss',
})
export class MenuTabs {
  private menuService = inject(MenuService);

  @Input() tabs: MenuTabItem[] = [];
  @Input() activeTabId = '';
  @Output() tabSelected = new EventEmitter<string>();

  isAddTab = signal(false);
  isSubmitting = signal(false);
  @ViewChild('tabInput') tabInput!: ElementRef<HTMLInputElement>;

  selectTab(id: string) {
    this.tabSelected.emit(id);
  }

  /** Удаляет вкладку. Останавливает всплытие клика, чтобы не сработал tabSelected. */
  onDeleteTab(id: string, event: Event): void {
    event.stopPropagation();

    const tab = this.tabs.find((t) => t.id === id);
    const label = tab ? tab.name : 'this tab';
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) {
      return;
    }

    console.log('[MenuTabs] Deleting tab:', id);
    this.menuService.deleteMenuTab(id).subscribe({
      next: () => {
        console.log('[MenuTabs] Tab deleted:', id);
        // Если удалили активную вкладку — переключаемся на первую оставшуюся.
        if (this.activeTabId === id) {
          const remaining = this.tabs.filter((t) => t.id !== id);
          if (remaining.length > 0) {
            this.tabSelected.emit(remaining[0].id);
          }
        }
      },
      error: (err) => {
        console.error('[MenuTabs] Failed to delete tab:', err);
      },
    });
  }

  // В menu-tabs.ts
  async onSaveNewTab(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    if (this.isSubmitting()) return;

    const value = this.tabInput.nativeElement.value.trim();
    if (value.length <= 1) {
      this.tabInput.nativeElement.value = '';
      this.isAddTab.set(false);
      return;
    }

    const menus = this.menuService.menus();
    if (menus.length === 0) {
      // Попробуем загрузить данные перед созданием
      console.log('[MenuTabs] Menus not loaded, loading...');
      this.isSubmitting.set(true);
      try {
        await this.menuService.refreshData().toPromise();
        // после загрузки проверяем снова
        const menusAfter = this.menuService.menus();
        if (menusAfter.length === 0) {
          console.error('[MenuTabs] No menus after loading');
          this.isSubmitting.set(false);
          return;
        }
      } catch (err) {
        console.error('[MenuTabs] Failed to load menus:', err);
        this.isSubmitting.set(false);
        return;
      }
    }

    const menusNow = this.menuService.menus();
    const menuId = menusNow[0].id;
    const name = FirstLetterUp(value);

    const exists = this.tabs.some((t) => t.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      console.warn('[MenuTabs] Tab already exists:', name);
      this.isAddTab.set(false);
      this.tabInput.nativeElement.value = '';
      this.isSubmitting.set(false);
      return;
    }

    const newMenuTab = {
      name: name,
      menuId: menuId,
      sortOrder: this.tabs.length,
    };

    this.isSubmitting.set(true);
    this.menuService.createMenuTab(newMenuTab).subscribe({
      next: (result) => {
        // createMenuTab() уже сам вызывает refreshData() внутри MenuService —
        // повторный вызов здесь просто дублировал сетевой запрос.
        console.log('[MenuTabs] Created:', result);
        // Важно: сначала используем/чистим инпут, ПОТОМ скрываем его через isAddTab(false) —
        // иначе *ngIf уже уберёт элемент из DOM, и tabInput.nativeElement станет undefined.
        this.tabInput.nativeElement.value = '';
        this.isAddTab.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('[MenuTabs] Error:', err);
        this.isSubmitting.set(false);
        this.isAddTab.set(false);
      },
    });
  }

  onAddNewTab() {
    if (this.isSubmitting()) return;
    this.isAddTab.set(true);
    setTimeout(() => {
      this.tabInput?.nativeElement.focus();
    });
  }
}
