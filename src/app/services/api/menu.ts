import { computed, Injectable, signal } from '@angular/core';

export interface Menu {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  dateCreated: string;
}

export interface MenuTab {
  id: string;
  label: string;
}

export interface Category {
  id: string;
  label: string;
}

export interface MenuItem {
  id: string;
  menuId: string;
  image?: string;
  name: string;
  category?: string;
  description: string;
  price: number;
  diets: string[];
  allergens: string[];
  dateAdded: string;
  stopListDateAdded?: string;
  stopList: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menusKey = 'menus';
  private menuTabsKey = 'menu-tabs';
  private categoriesKey = 'categories';
  private menuItemsKey = 'menu-items';

  menus = signal<Menu[]>([]);
  menuTabs = signal<MenuTab[]>([]);
  categories = signal<Category[]>([]);
  menuItems = signal<MenuItem[]>([]);

  constructor() {
    this.load();
  }

  private load() {
    const savedMenus = localStorage.getItem(this.menusKey);
    const savedTabs = localStorage.getItem(this.menuTabsKey);
    const savedCategories = localStorage.getItem(this.categoriesKey);
    const savedItems = localStorage.getItem(this.menuItemsKey);

    this.menus.set(
      savedMenus
        ? JSON.parse(savedMenus)
        : [
            {
              id: 'main',
              name: 'Main menu',
              description: 'Main restaurant menu',
              active: true,
              dateCreated: new Date().toISOString(),
            },
            {
              id: 'seasonal',
              name: 'Seasonal menu',
              description: 'Seasonal dishes',
              active: true,
              dateCreated: new Date().toISOString(),
            },
            {
              id: 'drinks',
              name: 'Drinks',
              description: 'Cold and hot drinks',
              active: true,
              dateCreated: new Date().toISOString(),
            },
          ],
    );

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

    this.menuItems.set(savedItems ? JSON.parse(savedItems) : this.generateDefaultMenu());
  }

  // ======================
  // MENUS
  // ======================

  addMenu(menu: Menu) {
    const updated = [...this.menus(), menu];

    this.menus.set(updated);
    this.saveMenus(updated);
  }

  updateMenu(menu: Menu) {
    const updated = this.menus().map((item) => (item.id === menu.id ? menu : item));

    this.menus.set(updated);
    this.saveMenus(updated);
  }

  deleteMenu(id: string) {
    const updated = this.menus().filter((item) => item.id !== id);

    this.menus.set(updated);
    this.saveMenus(updated);

    // удалить блюда этого меню
    const items = this.menuItems().filter((item) => item.menuId !== id);

    this.menuItems.set(items);
    this.saveMenuItems(items);
  }

  getMenu(id: string) {
    return this.menus().find((menu) => menu.id === id);
  }

  // ======================
  // MENU ITEMS
  // ======================

  private generateDefaultMenu(): MenuItem[] {
    return [
      {
        id: '1',
        menuId: 'main',
        name: 'Truffle Mushroom Risotto',
        category: 'main-dishes',
        description: 'Creamy risotto with mushrooms, parmesan and truffle oil',
        price: 42,
        diets: ['vegetarian'],
        allergens: ['milk'],
        dateAdded: '2026-01-01',
        stopList: false,
      },
      {
        id: '2',
        menuId: 'main',
        name: 'Classic Beef Burger',
        category: 'main-dishes',
        description: 'Beef patty, cheddar cheese, lettuce and house sauce',
        price: 38,
        diets: [],
        allergens: ['gluten', 'milk', 'egg'],
        dateAdded: '2026-01-02',
        stopList: false,
      },
      {
        id: '3',
        menuId: 'main',
        name: 'Margherita Pizza',
        category: 'main-dishes',
        description: 'Tomato sauce, mozzarella and fresh basil',
        price: 32,
        diets: ['vegetarian'],
        allergens: ['gluten', 'milk'],
        dateAdded: '2026-01-03',
        stopList: false,
      },
      {
        id: '4',
        menuId: 'main',
        name: 'Grilled Salmon',
        category: 'main-dishes',
        description: 'Fresh salmon fillet with vegetables',
        price: 55,
        diets: ['keto'],
        allergens: ['fish'],
        dateAdded: '2026-01-04',
        stopList: false,
      },
      {
        id: '5',
        menuId: 'main',
        name: 'Chicken Caesar Salad',
        category: 'salads',
        description: 'Chicken, lettuce, parmesan and Caesar dressing',
        price: 29,
        diets: [],
        allergens: ['milk', 'egg'],
        dateAdded: '2026-01-05',
        stopList: false,
      },
      {
        id: '6',
        menuId: 'seasonal',
        name: 'Pumpkin Cream Soup',
        category: 'soups',
        description: 'Seasonal pumpkin soup with cream and herbs',
        price: 22,
        diets: ['vegetarian'],
        allergens: ['milk'],
        dateAdded: '2026-01-06',
        stopList: false,
      },
      {
        id: '7',
        menuId: 'seasonal',
        name: 'Beef Steak',
        category: 'main-dishes',
        description: 'Grilled beef steak with pepper sauce',
        price: 65,
        diets: ['keto'],
        allergens: [],
        dateAdded: '2026-01-07',
        stopList: false,
      },
      {
        id: '8',
        menuId: 'main',
        name: 'Vegetable Pasta',
        category: 'main-dishes',
        description: 'Pasta with vegetables and tomato sauce',
        price: 31,
        diets: ['vegetarian'],
        allergens: ['gluten'],
        dateAdded: '2026-01-08',
        stopList: false,
      },
      {
        id: '9',
        menuId: 'main',
        name: 'French Fries',
        category: 'side-dishes',
        description: 'Crispy potato fries',
        price: 14,
        diets: ['vegan'],
        allergens: [],
        dateAdded: '2026-01-09',
        stopList: false,
      },
      {
        id: '10',
        menuId: 'main',
        name: 'Greek Salad',
        category: 'salads',
        description: 'Tomatoes, cucumber, olives and feta cheese',
        price: 26,
        diets: ['vegetarian'],
        allergens: ['milk'],
        dateAdded: '2026-01-10',
        stopList: false,
      },
      {
        id: '11',
        menuId: 'drinks',
        name: 'Espresso',
        category: 'drinks',
        description: 'Strong Italian espresso coffee',
        price: 10,
        diets: ['vegan'],
        allergens: [],
        dateAdded: '2026-01-11',
        stopList: false,
      },
      {
        id: '12',
        menuId: 'drinks',
        name: 'Fresh Orange Juice',
        category: 'drinks',
        description: 'Freshly squeezed orange juice',
        price: 15,
        diets: ['vegan'],
        allergens: [],
        dateAdded: '2026-01-12',
        stopList: false,
      },
      {
        id: '13',
        menuId: 'deserts',
        name: 'Chocolate Cake',
        category: 'deserts',
        description: 'Dark chocolate cake with cream',
        price: 24,
        diets: [],
        allergens: ['milk', 'egg', 'gluten'],
        dateAdded: '2026-01-13',
        stopList: false,
      },
      {
        id: '14',
        menuId: 'deserts',
        name: 'Cheesecake',
        category: 'deserts',
        description: 'Classic New York cheesecake',
        price: 25,
        diets: ['vegetarian'],
        allergens: ['milk', 'egg'],
        dateAdded: '2026-01-14',
        stopList: false,
      },
      {
        id: '15',
        menuId: 'main',
        name: 'Chicken Wrap',
        category: 'main-dishes',
        description: 'Chicken wrap with vegetables and sauce',
        price: 27,
        diets: [],
        allergens: ['gluten'],
        dateAdded: '2026-01-15',
        stopList: false,
      },
      {
        id: '16',
        menuId: 'main',
        name: 'Seafood Pasta',
        category: 'main-dishes',
        description: 'Pasta with shrimp and seafood sauce',
        price: 48,
        diets: [],
        allergens: ['gluten', 'shellfish'],
        dateAdded: '2026-01-16',
        stopList: false,
      },
      {
        id: '17',
        menuId: 'seasonal',
        name: 'Avocado Toast',
        category: 'starters',
        description: 'Toast with avocado and herbs',
        price: 23,
        diets: ['vegan'],
        allergens: ['gluten'],
        dateAdded: '2026-01-17',
        stopList: false,
      },
      {
        id: '18',
        menuId: 'main',
        name: 'Duck Breast',
        category: 'main-dishes',
        description: 'Roasted duck breast with sauce',
        price: 58,
        diets: [],
        allergens: [],
        dateAdded: '2026-01-18',
        stopList: false,
      },
      {
        id: '19',
        menuId: 'drinks',
        name: 'Green Tea',
        category: 'drinks',
        description: 'Japanese green tea',
        price: 12,
        diets: ['vegan'],
        allergens: [],
        dateAdded: '2026-01-19',
        stopList: false,
      },
      {
        id: '20',
        menuId: 'deserts',
        name: 'Fruit Plate',
        category: 'deserts',
        description: 'Fresh seasonal fruits',
        price: 20,
        diets: ['vegan'],
        allergens: [],
        dateAdded: '2026-01-20',
        stopList: false,
      },
    ];
  }

  addMenuItem(item: MenuItem) {
    const updated = [...this.menuItems(), item];
    this.menuItems.set(updated);
    this.saveMenuItems(updated);
  }

  updateMenuItem(item: MenuItem) {
    const updated = this.menuItems().map((existing) => (existing.id === item.id ? item : existing));
    this.menuItems.set(updated);
    this.saveMenuItems(updated);
  }

  deleteMenuItem(id: string) {
    const updated = this.menuItems().filter((item) => item.id !== id);

    this.menuItems.set(updated);
    this.saveMenuItems(updated);
  }

  getItemsByMenu(menuId: string) {
    return this.menuItems().filter((item) => item.menuId === menuId);
  }

  // ======================
  // STORAGE
  // ======================

  private saveMenus(data: Menu[]) {
    localStorage.setItem(this.menusKey, JSON.stringify(data));
  }
  // ======================
  // CATEGORIES
  // ======================

  addCategory(category: Category) {
    const updated = [...this.categories(), category];

    this.categories.set(updated);
    this.saveCategories(updated);
  }

  updateCategory(category: Category) {
    const updated = this.categories().map((item) => (item.id === category.id ? category : item));

    this.categories.set(updated);
    this.saveCategories(updated);
  }

  deleteCategory(id: string) {
    const updated = this.categories().filter((item) => item.id !== id);

    this.categories.set(updated);
    this.saveCategories(updated);
  }

  private saveMenuItems(data: MenuItem[]) {
    localStorage.setItem(this.menuItemsKey, JSON.stringify(data));
  }

  private saveCategories(data: Category[]) {
    localStorage.setItem(this.categoriesKey, JSON.stringify(data));
  }

  private saveTabs(data: MenuTab[]) {
    localStorage.setItem(this.menuTabsKey, JSON.stringify(data));
  }
  addToStopList(id: string): void {
    this.menuItems.update((items) =>
      items.map((i) =>
        i.id === id ? { ...i, stopList: true, stopListDateAdded: new Date().toLocaleString() } : i,
      ),
    );
  }

  removeFromStopList(id: string): void {
    this.menuItems.update((items) =>
      items.map((i) => (i.id === id ? { ...i, stopList: false, stopListDateAdded: '' } : i)),
    );
  }
  // MenuService
  stopListCount = computed(() => this.menuItems().filter((item) => item.stopList === true).length);
  syncWithServer() {}
}
