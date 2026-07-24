import { Injectable, signal } from '@angular/core';

export interface MenuTab {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menuTabsKey = 'menu-tabs';
  private categoriesKey = 'categories';

  menuTabs = signal<MenuTab[]>([]);
  categories = signal<Category[]>([]);

  constructor() {
    this.load();
  }

  private load() {
    const savedTabs = localStorage.getItem(this.menuTabsKey);
    const savedCategories = localStorage.getItem(this.categoriesKey);

    this.menuTabs.set(
      savedTabs
        ? JSON.parse(savedTabs)
        : [
            { id: 'seasonal', label: 'Seasonal menu' },
            { id: 'main', label: 'Main menu' },
            { id: 'drinks', label: 'Drinks' },
            { id: 'deserts', label: 'Deserts' },
          ],
    );

    this.categories.set(
      savedCategories
        ? JSON.parse(savedCategories)
        : [
            { id: 'starters', label: 'Starters' },
            { id: 'soups', label: 'Soups' },
            { id: 'salads', label: 'Salads' },
            { id: 'side-dishes', label: 'Side dishes' },
            { id: 'main-dishes', label: 'Main dishes' },
          ],
    );
  }

  // CREATE
  addCategory(category: Category) {
    const updated = [...this.categories(), category];
    this.categories.set(updated);
    this.saveCategories(updated);
  }

  addMenuTab(tab: MenuTab) {
    const updated = [...this.menuTabs(), tab];
    this.menuTabs.set(updated);
    this.saveTabs(updated);
  }

  // UPDATE
  updateCategory(category: Category) {
    const updated = this.categories().map((item) => (item.id === category.id ? category : item));

    this.categories.set(updated);
    this.saveCategories(updated);
  }

  updateMenuTab(tab: MenuTab) {
    const updated = this.menuTabs().map((item) => (item.id === tab.id ? tab : item));

    this.menuTabs.set(updated);
    this.saveTabs(updated);
  }

  // DELETE
  deleteCategory(id: string) {
    const updated = this.categories().filter((item) => item.id !== id);

    this.categories.set(updated);
    this.saveCategories(updated);
  }

  deleteMenuTab(id: string) {
    const updated = this.menuTabs().filter((item) => item.id !== id);

    this.menuTabs.set(updated);
    this.saveTabs(updated);
  }

  private saveCategories(data: Category[]) {
    localStorage.setItem(this.categoriesKey, JSON.stringify(data));
  }

  private saveTabs(data: MenuTab[]) {
    localStorage.setItem(this.menuTabsKey, JSON.stringify(data));
  }

  // Later replace this with HttpClient
  syncWithServer() {
    // POST/PUT data to backend
    // then reload from server response
  }
}
