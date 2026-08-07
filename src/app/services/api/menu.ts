import { computed, Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, switchMap } from 'rxjs';
import { MenuItem } from '../../models/menu-item.model';
import { AuthService } from '../auth/auth-service';
import { Menu, MenuTab } from '../../models/menu.model';
import { Category } from '../../models/category.model';
import { environment } from '../../../environments/environment';

export interface Allergen {
  id: string;
  name: string;
  description?: string;
}

export interface MenuResponse {
  menus: Menu[];
  menuTabs: MenuTab[];
  categories: Category[];
  menuItems: MenuItem[];
  totalMenus: number;
  totalItems: number;
  stopListCount: number;
  activeMenusCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  // Сигналы
  menus = signal<Menu[]>([]);
  menuTabs = signal<MenuTab[]>([]);
  categories = signal<Category[]>([]);
  menuItems = signal<MenuItem[]>([]);
  allergens = signal<Allergen[]>([]);
  error = signal<string | null>(null);
  isInitialized = signal<boolean>(false);

  // Вычисляемые сигналы
  stopListCount = computed(() => this.menuItems().filter((item) => item.isStopList).length);
  activeMenusCount = computed(() => this.menus().filter((menu) => menu.isActive).length);

  constructor() {
    this.loadAllData();
  }

  // ========================================
  // ПРОВЕРКА ПРАВ И ОБРАБОТКА ОШИБОК
  // ========================================

  private checkPermissions(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.error.set('User is not authenticated');
      return false;
    }
    const role = this.authService.getUserRole();
    if (!['admin', 'manager', 'client'].includes(role)) {
      this.error.set('User does not have required permissions');
      return false;
    }
    return true;
  }

  private handleError(err: HttpErrorResponse): void {
    if (err.status === 403) {
      this.error.set('You do not have permission. Required roles: admin or client');
    } else if (err.status === 401) {
      this.error.set('Please log in to perform this action');
    } else if (err.status === 404) {
      this.error.set('Resource not found');
    } else if (err.status === 409) {
      this.error.set('Duplicate entry. This name already exists.');
    } else if (err.status === 0) {
      this.error.set('Network error. Please check your connection.');
    } else {
      this.error.set(err.message || 'An error occurred');
    }
    console.error('[MenuService] Error:', this.error());
  }

  // ========================================
  // ЗАГРУЗКА И ОБНОВЛЕНИЕ ДАННЫХ
  // ========================================

  loadAllData(): void {
    this.error.set(null);

    this.http
      .get<MenuResponse>(`${this.apiUrl}/Menus/all`)
      .pipe(
        tap({
          next: (data) => {
            console.log('[MenuService] Data loaded:', data);
            this.menus.set(data.menus || []);
            this.menuTabs.set(data.menuTabs || []);
            this.categories.set(data.categories || []);
            this.menuItems.set(data.menuItems || []);
            this.isInitialized.set(true);
          },
          error: (err: HttpErrorResponse) => {
            console.error('[MenuService] Failed to load data:', err);
            this.handleError(err);
            this.isInitialized.set(false);
          },
        }),
        catchError((err: HttpErrorResponse) => {
          this.isInitialized.set(false);
          this.handleError(err);
          return of(null);
        }),
      )
      .subscribe();
  }

  refreshData(): Observable<MenuResponse> {
    this.error.set(null);

    return this.http.get<MenuResponse>(`${this.apiUrl}/Menus/all`).pipe(
      tap({
        next: (data) => {
          console.log('[MenuService] Data refreshed:', data);
          this.menus.set(data.menus || []);
          this.menuTabs.set(data.menuTabs || []);
          this.categories.set(data.categories || []);
          this.menuItems.set(data.menuItems || []);
          this.isInitialized.set(true);
        },
        error: (err: HttpErrorResponse) => {
          console.error('[MenuService] Failed to refresh:', err);
          this.handleError(err);
        },
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  // ========================================
  // АЛЛЕРГЕНЫ
  // ========================================

  getAllergens(lang: string = 'ru'): Observable<Allergen[]> {
    this.error.set(null);
    return this.http.get<Allergen[]>(`${this.apiUrl}/Allergens`, { params: { lang } }).pipe(
      tap({
        next: (data) => {
          this.allergens.set(data || []);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        },
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  // ========================================
  // КАТЕГОРИИ
  // ========================================

  getCategories(menuTabId?: string): Observable<Category[]> {
    this.error.set(null);
    const params: any = {};
    if (menuTabId) params.menuTabId = menuTabId;
    return this.http.get<Category[]>(`${this.apiUrl}/Categories`, { params }).pipe(
      tap({
        next: (data) => {
          this.categories.set(data || []);
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        },
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  createCategory(category: {
    name: string;
    description?: string;
    menuTabId?: string;
    sortOrder?: number;
  }): Observable<Category> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    const payload = {
      name: category.name,
      description: category.description || '',
      menuTabId: category.menuTabId,
      sortOrder: category.sortOrder || 0,
    };
    return this.http.post<Category>(`${this.apiUrl}/Categories`, payload).pipe(
      tap({
        next: (newCategory) => {
          console.log('[MenuService] Category created:', newCategory);
          this.categories.update((items) => [...items, newCategory]);
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  deleteCategory(id: string): Observable<void> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    return this.http.delete<void>(`${this.apiUrl}/Categories/${id}`).pipe(
      tap({
        next: () => {
          console.log('[MenuService] Category deleted:', id);
          this.categories.update((items) => items.filter((item) => item.id !== id));
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  // ========================================
  // МЕНЮ
  // ========================================

  getMenus(): Observable<Menu[]> {
    this.error.set(null);
    return this.http.get<Menu[]>(`${this.apiUrl}/Menus`).pipe(
      tap({
        next: (data) => this.menus.set(data || []),
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  createMenu(menu: { name: string; description?: string; sortOrder: number }): Observable<Menu> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    return this.http.post<Menu>(`${this.apiUrl}/Menus`, menu).pipe(
      tap({
        next: (newMenu) => {
          console.log('[MenuService] Menu created:', newMenu);
          this.menus.update((items) => [...items, newMenu]);
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  deleteMenu(id: string): Observable<void> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    return this.http.delete<void>(`${this.apiUrl}/Menus/${id}`).pipe(
      tap({
        next: () => {
          console.log('[MenuService] Menu deleted:', id);
          this.menus.update((items) => items.filter((item) => item.id !== id));
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  updateMenu(id: string, menu: Partial<Menu>): Observable<Menu> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    return this.http.put<Menu>(`${this.apiUrl}/Menus/${id}`, menu).pipe(
      tap({
        next: (updatedMenu) => {
          console.log('[MenuService] Menu updated:', updatedMenu);
          this.menus.update((items) =>
            items.map((item) => (item.id === updatedMenu.id ? updatedMenu : item)),
          );
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  // ========================================
  // ВКЛАДКИ (MenuTabs)
  // ========================================

  getMenuTabs(): Observable<MenuTab[]> {
    this.error.set(null);
    return this.http.get<MenuTab[]>(`${this.apiUrl}/MenuTabs`).pipe(
      tap({
        next: (data) => this.menuTabs.set(data || []),
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  createMenuTab(menuTab: {
    name: string;
    menuId: string;
    sortOrder?: number;
  }): Observable<MenuTab> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    const payload = {
      name: menuTab.name,
      menuId: menuTab.menuId,
      sortOrder: menuTab.sortOrder || 0,
    };
    return this.http.post<MenuTab>(`${this.apiUrl}/MenuTabs`, payload).pipe(
      tap({
        next: (newTab) => {
          console.log('[MenuService] Menu tab created:', newTab);
          this.menuTabs.update((items) => [...items, newTab]);
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  deleteMenuTab(id: string): Observable<void> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    return this.http.delete<void>(`${this.apiUrl}/MenuTabs/${id}`).pipe(
      tap({
        next: () => {
          console.log('[MenuService] Menu tab deleted:', id);
          this.menuTabs.update((items) => items.filter((item) => item.id !== id));
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  // ========================================
  // БЛЮДА (MenuItems)
  // ========================================

  createMenuItem(item: {
    name: string;
    description?: string;
    price: number;
    categoryId?: string;
    menuId: string;
    sortOrder?: number;
    imageUrl?: string;
    imageFileName?: string;
    diets?: string[];
    allergens?: string[];
    isAvailable?: boolean;
  }): Observable<MenuItem> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    const payload = {
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId,
      menuId: item.menuId,
      sortOrder: item.sortOrder || 0,
      imageUrl: item.imageUrl,
      imageFileName: item.imageFileName,
      diets: item.diets || [],
      allergens: item.allergens || [],
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    };
    return this.http.post<MenuItem>(`${this.apiUrl}/MenuItems`, payload).pipe(
      tap({
        next: (newItem) => {
          console.log('[MenuService] Menu item created:', newItem);
          this.menuItems.update((items) => [...items, newItem]);
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  deleteMenuItem(id: string): Observable<void> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    return this.http.delete<void>(`${this.apiUrl}/MenuItems/${id}`).pipe(
      tap({
        next: () => {
          console.log('[MenuService] Menu item deleted:', id);
          this.menuItems.update((items) => items.filter((item) => item.id !== id));
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  updateMenuItem(id: string, item: Partial<MenuItem>): Observable<MenuItem> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    return this.http.put<MenuItem>(`${this.apiUrl}/MenuItems/${id}`, item).pipe(
      tap({
        next: (updatedItem) => {
          console.log('[MenuService] Menu item updated:', updatedItem);
          this.menuItems.update((items) =>
            items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
          );
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  toggleStopList(id: string, isStopList: boolean): Observable<MenuItem> {
    if (!this.checkPermissions()) {
      return throwError(() => new Error(this.error() || 'Permission denied'));
    }
    this.error.set(null);
    const payload = {
      isStopList,
      stopListDateAdded: isStopList ? new Date().toISOString() : null,
    };
    return this.http.post<MenuItem>(`${this.apiUrl}/MenuItems/${id}/stoplist`, payload).pipe(
      tap({
        next: (updatedItem) => {
          console.log('[MenuService] Stop list toggled:', updatedItem);
          this.menuItems.update((items) =>
            items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
          );
        },
        error: (err: HttpErrorResponse) => this.handleError(err),
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return throwError(() => err);
      }),
    );
  }

  // ========================================
  // УДОБНЫЕ МЕТОДЫ ДЛЯ STOP LIST
  // ========================================

  addToStopList(id: string): Observable<MenuItem> {
    return this.toggleStopList(id, true);
  }

  removeFromStopList(id: string): Observable<MenuItem> {
    return this.toggleStopList(id, false);
  }

  // ========================================
  // МЕТОДЫ ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ИЗ СИГНАЛОВ
  // ========================================

  getActiveMenus(): Menu[] {
    return this.menus().filter((menu) => menu.isActive);
  }

  getMenuById(id: string): Menu | undefined {
    return this.menus().find((menu) => menu.id === id);
  }

  getMenuTabsByMenu(menuId: string): MenuTab[] {
    return this.menuTabs().filter((tab) => tab.menuId === menuId);
  }

  getCategoriesByMenuTab(menuTabId: string): Category[] {
    return this.categories().filter((cat) => cat.menuTabId === menuTabId);
  }

  getMenuItemsByCategory(categoryId: string): MenuItem[] {
    return this.menuItems().filter((item) => item.categoryId === categoryId);
  }

  getStopListItems(): MenuItem[] {
    return this.menuItems().filter((item) => item.isStopList);
  }

  // ========================================
  // АЛИАСЫ (Безопасное вызов через стрелочные функции)
  // ========================================

  addCategory = (category: Parameters<MenuService['createCategory']>[0]) =>
    this.createCategory(category);
  addMenu = (menu: Parameters<MenuService['createMenu']>[0]) => this.createMenu(menu);
  addMenuTab = (menuTab: Parameters<MenuService['createMenuTab']>[0]) =>
    this.createMenuTab(menuTab);
  addMenuItem = (item: Parameters<MenuService['createMenuItem']>[0]) => this.createMenuItem(item);
}
