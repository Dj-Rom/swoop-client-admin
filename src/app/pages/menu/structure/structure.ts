import { Component, signal, inject, computed } from '@angular/core';

import { StructureHeader } from '../../../components/structure-header/structure-header';
import { MenuTabs } from '../../../components/menu-tabs/menu-tabs';
import { CategoryPills } from '../../../components/category-pills/category-pills';
import { DishTable, DishGroup } from '../../../components/dish-table/dish-table';

import { MenuService } from '../../../services/api/menu';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [StructureHeader, MenuTabs, CategoryPills, DishTable],
  templateUrl: './structure.html',
  styleUrl: './structure.scss',
})
export class Structure {
  private menuService = inject(MenuService);

  menuTabs = this.menuService.menus;
  categories = this.menuService.categories;
  menuItems = this.menuService.menuItems;

  activeTabId = signal('seasonal');
  activeCategoryId = signal('starters');

  // преобразуем MenuItem -> DishTable формат
  groups = computed<DishGroup[]>(() => {
    const items = this.menuItems()
      .filter((item) => item.menuId === this.activeTabId())
      .filter((item) => !this.activeCategoryId() || item.category === this.activeCategoryId());

    const grouped = items.reduce(
      (acc, item) => {
        const category = item.category || 'other';

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push({
          id: item.id,

          image: item.image ?? 'https://placehold.co/64x64',

          title: item.name,

          description: item.description,

          price: item.price.toFixed(2),

          diets: item.diets.map((diet) => diet.substring(0, 2)),

          allergens: item.allergens.map((allergen) => allergen.substring(0, 2)),

          inStopList: item.stopList,

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

  onTabSelected(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  onCategorySelected(categoryId: string): void {
    this.activeCategoryId.set(categoryId);
  }

  onAddNew(): void {
    // open create dish dialog
  }

  onStopListToggled(event: { dishId: string; checked: boolean }): void {
    const item = this.menuItems().find((dish) => dish.id === event.dishId);

    if (!item) return;

    event.checked
      ? this.menuService.addToStopList(item.id)
      : this.menuService.removeFromStopList(item.id);
  }

  onDishesReordered(event: { groupId: string; dishes: DishGroup['dishes'] }): void {
    console.log('new order', event);

    // позже:
    // menuService.saveOrder(...)
  }

  private getBadge(item: any): string | undefined {
    const added = new Date(item.dateAdded);

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
    return this.categories().find((c) => c.id === id)?.label ?? id;
  }
}
