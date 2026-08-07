// components/category-pills/category-pills.ts
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
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-pills',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './category-pills.html',
  styleUrl: './category-pills.scss',
})
export class CategoryPills {
  private menuService = inject(MenuService);

  @Input() categories: Category[] = [];
  @Input() activeCategoryId = '';
  // ID вкладки, к которой сейчас относится этот список категорий.
  // Раньше компонент сам решал, к какой вкладке привязать новую категорию
  // (всегда брал menuTabs()[0]) — из-за этого категории со всех вкладок,
  // кроме первой, "терялись". Теперь родитель явно говорит, какая вкладка активна.
  @Input() activeMenuTabId = '';
  @Output() categorySelected = new EventEmitter<string>();

  isAddCategory = signal(false);
  @ViewChild('categoryInput') categoryInput!: ElementRef<HTMLInputElement>;

  selectCategory(id: string) {
    this.categorySelected.emit(id);
  }

  /** Удаляет категорию. Останавливает всплытие клика, чтобы не сработал categorySelected. */
  onDeleteCategory(id: string, event: Event): void {
    event.stopPropagation();

    const category = this.categories.find((c) => c.id === id);
    const label = category ? category.name : 'this category';
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) {
      return;
    }

    console.log('[CategoryPills] Deleting category:', id);
    this.menuService.deleteCategory(id).subscribe({
      next: () => {
        console.log('[CategoryPills] Category deleted:', id);
        if (this.activeCategoryId === id) {
          const remaining = this.categories.filter((c) => c.id !== id);
          if (remaining.length > 0) {
            this.categorySelected.emit(remaining[0].id);
          }
        }
      },
      error: (err) => {
        console.error('[CategoryPills] Failed to delete category:', err);
      },
    });
  }

  onSaveNewCategory(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;

    const value = this.categoryInput.nativeElement.value.trim();
    if (value.length <= 1) {
      this.categoryInput.nativeElement.value = '';
      this.isAddCategory.set(false);
      return;
    }

    if (!this.activeMenuTabId) {
      console.error('[CategoryPills] No active menu tab selected. Please select a tab first.');
      this.isAddCategory.set(false);
      return;
    }

    const name = FirstLetterUp(value);
    // Раньше здесь было menuTabs()[0].id — всегда первая вкладка независимо от того,
    // какая реально открыта. Теперь используем activeMenuTabId, переданный родителем.
    const menuTabId = this.activeMenuTabId;

    // Проверка на дубликат на фронтенде (в рамках текущей вкладки, т.к. this.categories
    // теперь уже отфильтрован родителем по activeMenuTabId).
    const exists = this.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      console.warn('[CategoryPills] Category already exists:', name);
      this.isAddCategory.set(false);
      this.categoryInput.nativeElement.value = '';
      return;
    }

    const newCategory = {
      name: name,
      description: '',
      menuTabId: menuTabId,
      sortOrder: 0,
    };

    console.log('[CategoryPills] Sending:', newCategory);

    this.menuService.createCategory(newCategory).subscribe({
      next: (result) => {
        // createCategory() уже сам вызывает refreshData() внутри MenuService —
        // повторный вызов здесь просто дублировал сетевой запрос.
        console.log('[CategoryPills] Created:', result);
        this.categoryInput.nativeElement.value = '';
        this.isAddCategory.set(false);
      },
      error: (err) => {
        console.error('[CategoryPills] Failed to create category:', err);
        this.isAddCategory.set(false);
      },
    });
  }

  onAddNewCategory() {
    this.isAddCategory.set(true);
    setTimeout(() => {
      this.categoryInput?.nativeElement.focus();
    });
  }
}
