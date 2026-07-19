import { Component, signal } from '@angular/core';
import { StructureHeader } from '../../../components/structure-header/structure-header';
import { MenuTabs, MenuTab } from '../../../components/menu-tabs/menu-tabs';
import { CategoryPills, Category } from '../../../components/category-pills/category-pills';
import { DishTable, DishGroup } from '../../../components/dish-table/dish-table';

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [StructureHeader, MenuTabs, CategoryPills, DishTable],
  templateUrl: './structure.html',
  styleUrl: './structure.scss',
})
export class Structure {
  menuTabs: MenuTab[] = [
    { id: 'seasonal', label: 'Seasonal menu' },
    { id: 'main', label: 'Main menu' },
    { id: 'drinks', label: 'Drinks' },
    { id: 'deserts', label: 'Deserts' },
  ];
  activeTabId = signal('seasonal');

  categories: Category[] = [
    { id: 'starters', label: 'Starters' },
    { id: 'soups', label: 'Soups' },
    { id: 'salads', label: 'Salads' },
    { id: 'side-dishes', label: 'Side dishes' },
    { id: 'main-dishes', label: 'Main dishes' },
  ];
  activeCategoryId = signal('starters');

  groups = signal<DishGroup[]>([
    {
      id: 'starters',
      title: 'Starters',
      dishes: [
        {
          id: '1',
          image: 'https://placehold.co/64x64',
          title: 'Title',
          badgeLabel: 'Popular',
          description: 'Description',
          price: '00,00',
          diets: ['Ve', 'Ve'],
          allergens: ['Al', 'Eg'],
          inStopList: false,
        },
        {
          id: '2',
          image: 'https://placehold.co/64x64',
          title: 'Title',
          description: 'Description',
          price: '00,00',
          diets: ['Ve', 'Ve'],
          allergens: ['Al', 'Eg'],
          inStopList: false,
        },
        {
          id: '3',
          image: 'https://placehold.co/64x64',
          title: 'Title',
          badgeLabel: 'New',
          description: 'Description',
          price: '00,00',
          diets: ['Ve', 'Ve'],
          allergens: ['Al', 'Eg'],
          inStopList: false,
        },
        {
          id: '4',
          image: 'https://placehold.co/64x64',
          title: 'Title',
          badgeLabel: 'Popular',
          description: 'Description',
          price: '00,00',
          diets: ['Ve', 'Ve'],
          allergens: ['Al', 'Eg'],
          inStopList: true,
        },
      ],
    },
  ]);

  onTabSelected(tabId: string): void {
    this.activeTabId.set(tabId);
  }

  onCategorySelected(categoryId: string): void {
    this.activeCategoryId.set(categoryId);
  }

  onAddNew(): void {
    // TODO: open "add new dish" dialog
  }

  onStopListToggled(event: { dishId: string; checked: boolean }): void {
    this.groups.update((groups) =>
      groups.map((group) => ({
        ...group,
        dishes: group.dishes.map((dish) =>
          dish.id === event.dishId ? { ...dish, inStopList: event.checked } : dish,
        ),
      })),
    );
  }

  onDishesReordered(event: { groupId: string; dishes: DishGroup['dishes'] }): void {
    this.groups.update((groups) =>
      groups.map((group) =>
        group.id === event.groupId ? { ...group, dishes: event.dishes } : group,
      ),
    );
    // TODO: persist new order to backend, e.g.:
    // this.menuService.reorderDishes(event.groupId, event.dishes.map(d => d.id));
  }
}
