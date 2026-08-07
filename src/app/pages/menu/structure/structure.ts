// pages/menu/structure/structure.ts
import { Component, signal, inject, computed, effect } from '@angular/core';
import { StructureHeader } from '../../../components/structure-header/structure-header';
import { MenuTabs } from '../../../components/menu-tabs/menu-tabs';
import { CategoryPills } from '../../../components/category-pills/category-pills';
import { DishTable, DishGroup } from '../../../components/dish-table/dish-table';
import { MenuService } from '../../../services/api/menu';
import { Router } from '@angular/router';
import { MenuTabItem } from '../../../models/menu.model';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [StructureHeader, MenuTabs, CategoryPills, DishTable],
  templateUrl: './structure.html',
  styleUrl: './structure.scss',
})
export class Structure {
  private menuService = inject(MenuService);
  private router = inject(Router);

  menuTabs = computed<MenuTabItem[]>(() => {
    return this.menuService.menuTabs().map((tab) => ({
      id: tab.id,
      name: tab.name,
      menuId: tab.menuId,
      sortOrder: tab.sortOrder,
      createdAt: tab.createdAt,
    }));
  });

  menuItems = this.menuService.menuItems;

  // Начинаем пустыми — реальные GUID'ы подставит effect() ниже, как только вкладки загрузятся.
  activeTabId = signal('');
  activeCategoryId = signal('');

  // Категории, принадлежащие текущей активной вкладке (а не все категории сразу).
  categories = computed(() => {
    const tabId = this.activeTabId();
    if (!tabId) return [];
    return this.menuService.categories().filter((cat) => cat.menuTabId === tabId);
  });

  // id категорий текущей вкладки — нужен, чтобы отфильтровать блюда без опоры на
  // несуществующее item.menuId (в MenuItemDto с бэкенда такого поля нет, только categoryId).
  private activeCategoryIds = computed(() => new Set(this.categories().map((c) => c.id)));

  groups = computed<DishGroup[]>(() => {
    const tabCategoryIds = this.activeCategoryIds();

    const items = this.menuItems()
      .filter((item) => item.categoryId && tabCategoryIds.has(item.categoryId))
      .filter((item) => !this.activeCategoryId() || item.categoryId === this.activeCategoryId());

    const grouped = items.reduce(
      (acc, item) => {
        const category = item.categoryId || 'other';

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push({
          id: item.id,
          imageUrl: item.imageUrl ?? 'https://placehold.co/64x64',
          title: item.name,
          description: item.description || '',
          price: item.price.toFixed(2),
          diets: item.diets.map((diet) => diet.substring(0, 2)),
          allergens: item.allergens.map((allergen) => allergen.substring(0, 2)),
          inStopList: item.isStopList,
          badgeLabel: this.getBadge(item),
        });

        return acc;
      },
      {} as Record<string, DishGroup['dishes']>,
    );

    return Object.entries(grouped).map(([category, dishes]) => ({
      id: category,
      title: this.getCategoryName(category),
      dishes,
    }));
  });

  constructor() {
    // Как только реальные вкладки загрузятся — выбираем первую автоматически.
    effect(() => {
      const tabs = this.menuTabs();
      if (tabs.length > 0 && !this.activeTabId()) {
        this.activeTabId.set(tabs[0].id);
      }
    });
  }

  onAddNew(): void {
    this.router.navigate(['/menu/structure/add-new']);
  }

  onTabSelected(tabId: string): void {
    this.activeTabId.set(tabId);
    // Сбрасываем категорию — она принадлежала предыдущей вкладке.
    this.activeCategoryId.set('');
  }

  onCategorySelected(categoryId: string): void {
    this.activeCategoryId.set(categoryId);
  }

  onStopListToggled(event: { dishId: string; checked: boolean }): void {
    const item = this.menuItems().find((dish) => dish.id === event.dishId);
    if (!item) return;

    if (event.checked) {
      this.menuService.addToStopList(item.id).subscribe({
        next: () => console.log('Added to stop list'),
        error: (err) => console.error('Failed to add to stop list:', err),
      });
    } else {
      this.menuService.removeFromStopList(item.id).subscribe({
        next: () => console.log('Removed from stop list'),
        error: (err) => console.error('Failed to remove from stop list:', err),
      });
    }
  }

  onDishesReordered(event: { groupId: string; dishes: DishGroup['dishes'] }): void {
    console.log('new order', event);
  }

  private getBadge(item: any): string | undefined {
    const added = new Date(item.createdAt);
    const now = new Date();
    const diff = (now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24);

    if (diff < 7) {
      return 'New';
    }

    if (item.diets.includes('vegetarian')) {
      return 'Popular';
    }

    return undefined;
  }

  private getCategoryName(id: string): string {
    return this.categories().find((c) => c.id === id)?.name ?? id;
  }
}
