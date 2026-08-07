import {
  Component,
  OnInit,
  signal,
  WritableSignal,
  inject,
  computed,
  effect,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TagItem, TagService } from '../../../../services/tag.service';
import { MenuItem } from '../../../../models/menu-item.model';
import { ItemFormComponent } from '../../../../components/item-form/item-form';
import { ImageUploadComponent } from '../../../../components/image-upload/image-upload';
import { ItemPreviewComponent } from '../../../../components/item-preview/item-preview';
import { Breadcrumbs } from '../../../../components/breadcrumbs/breadcrumbs';
import { MenuService } from '../../../../services/api/menu';
import { UploadResult } from '../../../../services/image-upload.service';

@Component({
  selector: 'app-add-new-item-page',
  standalone: true,
  imports: [
    CommonModule,
    ItemFormComponent,
    ImageUploadComponent,
    ItemPreviewComponent,
    Breadcrumbs,
  ],
  templateUrl: './add-new-item-menu.html',
  styleUrl: './add-new-item-menu.scss',
})
export class AddNewItemMenu implements OnInit {
  private tagService = inject(TagService);
  private menuService = inject(MenuService);
  private destroyRef = inject(DestroyRef);

  // Теги
  diets = signal<TagItem[]>([]);
  allergens = signal<TagItem[]>([]);

  // Данные из сервиса
  menus = this.menuService.menus;
  menuTabs = this.menuService.menuTabs;
  categories = this.menuService.categories;

  // Выбранные ID
  selectedMenuTabId = signal<string>('');
  selectedMenuId = signal<string>(''); // ID меню, извлечённый из выбранной вкладки
  selectedCategoryId = signal<string>('');

  // Состояние добавления вкладки
  showAddTab = signal(false);
  newTabName = signal('');
  newTabMenuId = signal('');

  // Состояние добавления категории
  showAddCategory = signal(false);
  newCategoryName = signal('');
  newCategoryMenuTabId = signal(''); // ← выбор вкладки для новой категории

  // Фильтрованные категории по выбранной вкладке (актуально)
  filteredCategories = computed(() => {
    const tabId = this.selectedMenuTabId();
    if (!tabId) return this.categories();
    return this.categories().filter((cat) => cat.menuTabId === tabId);
  });

  // Объект блюда
  item = signal<MenuItem>(this.createEmptyItem());

  constructor() {
    // Автовыбор первой вкладки при загрузке
    effect(() => {
      const tabs = this.menuTabs();
      if (tabs.length > 0 && !this.selectedMenuTabId()) {
        const firstTab = tabs[0];
        this.selectedMenuTabId.set(firstTab.id);
        this.selectedMenuId.set(firstTab.menuId);
        this.item.update((i) => ({ ...i, menuId: firstTab.menuId }));
      }
    });
  }

  ngOnInit() {
    // Загрузка тегов
    this.tagService
      .getDiets()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.diets.set(data),
        error: (err) => console.error('Diets load error', err),
      });

    this.tagService
      .getAllergens()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.allergens.set(data),
        error: (err) => console.error('Allergens load error', err),
      });

    // Подстраховка загрузки данных
    if (this.menus().length === 0) {
      this.menuService.loadAllData();
    }
  }

  updateItem(data: Partial<MenuItem>) {
    this.item.update((current) => ({ ...current, ...data }));
  }

  // ===== ВЫБОР ВКЛАДКИ =====
  onMenuTabSelected(tabId: string) {
    if (!tabId) {
      this.selectedMenuTabId.set('');
      this.selectedMenuId.set('');
      this.selectedCategoryId.set('');
      this.item.update((i) => ({ ...i, menuId: '', categoryId: '', categoryName: '' }));
      return;
    }
    this.selectedMenuTabId.set(tabId);
    const tab = this.menuTabs().find((t) => t.id === tabId);
    if (tab) {
      this.selectedMenuId.set(tab.menuId);
      this.item.update((i) => ({ ...i, menuId: tab.menuId }));
    }
    // Сброс категории
    this.selectedCategoryId.set('');
    this.item.update((i) => ({ ...i, categoryId: '', categoryName: '' }));
  }

  // ===== ВЫБОР КАТЕГОРИИ =====
  onCategorySelected(categoryId: string) {
    if (!categoryId) {
      this.selectedCategoryId.set('');
      this.item.update((i) => ({ ...i, categoryId: '', categoryName: '' }));
      return;
    }
    this.selectedCategoryId.set(categoryId);
    this.item.update((i) => ({ ...i, categoryId }));
    const category = this.categories().find((c) => c.id === categoryId);
    if (category) {
      this.item.update((i) => ({ ...i, categoryName: category.name }));
    }
  }

  // ===== СОЗДАНИЕ ВКЛАДКИ =====
  createNewTab() {
    const name = this.newTabName().trim();
    const menuId = this.newTabMenuId();
    if (!name || !menuId) {
      console.error('Tab name and menu are required');
      return;
    }
    this.menuService.createMenuTab({ name, menuId, sortOrder: 0 }).subscribe({
      next: (tab) => {
        console.log('Tab created:', tab);
        this.newTabName.set('');
        this.newTabMenuId.set('');
        this.showAddTab.set(false);
        // Автовыбор созданной вкладки
        this.selectedMenuTabId.set(tab.id);
        this.selectedMenuId.set(tab.menuId);
        this.item.update((i) => ({ ...i, menuId: tab.menuId }));
      },
      error: (err) => console.error('Failed to create tab:', err),
    });
  }

  cancelAddTab() {
    this.showAddTab.set(false);
    this.newTabName.set('');
    this.newTabMenuId.set('');
  }

  // ===== СОЗДАНИЕ КАТЕГОРИИ (привязка к вкладке) =====
  createNewCategory() {
    const name = this.newCategoryName().trim();
    const menuTabId = this.newCategoryMenuTabId();
    if (!name || !menuTabId) {
      console.error('Category name and menu tab are required');
      return;
    }

    this.menuService
      .createCategory({
        name,
        menuTabId: menuTabId,
        sortOrder: 0,
      })
      .subscribe({
        next: (cat) => {
          console.log('Category created:', cat);
          this.newCategoryName.set('');
          this.newCategoryMenuTabId.set('');
          this.showAddCategory.set(false);
          // Автовыбор созданной категории
          this.selectedCategoryId.set(cat.id);
          this.item.update((i) => ({ ...i, categoryId: cat.id, categoryName: cat.name }));
        },
        error: (err) => console.error('Failed to create category:', err),
      });
  }

  cancelAddCategory() {
    this.showAddCategory.set(false);
    this.newCategoryName.set('');
    this.newCategoryMenuTabId.set('');
  }

  // ===== ОТМЕНА / СБРОС =====
  onCancel() {
    this.resetForm();
  }

  // ===== СОХРАНЕНИЕ БЛЮДА =====
  save() {
    const current = this.item();
    if (!current.name?.trim()) {
      console.error('Name is required');
      return;
    }
    if (!current.price || current.price <= 0) {
      console.error('Price is required and must be greater than 0');
      return;
    }
    if (!current.menuId) {
      console.error('Menu is required');
      return;
    }

    const newItem = {
      name: current.name.trim(),
      description: current.description?.trim() || '',
      price: current.price,
      categoryId: current.categoryId,
      imageUrl: current.imageUrl,
      diets: current.diets || [],
      allergens: current.allergens || [],
      isAvailable: true,
      isStopList: false,
      sortOrder: 0,
      menuId: current.menuId,
    };

    this.menuService.addMenuItem(newItem).subscribe({
      next: (result) => {
        console.log('Item added successfully:', result);
        this.resetForm();
      },
      error: (err) => console.error('Failed to add item:', err),
    });
  }

  private resetForm() {
    this.item.set(this.createEmptyItem());
    this.selectedCategoryId.set('');
    // Оставляем выбранную вкладку и меню
  }

  private createEmptyItem(): MenuItem {
    return {
      id: crypto.randomUUID(),
      menuId: this.selectedMenuId(),
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      categoryName: '',
      isAvailable: true,
      isStopList: false,
      stopListDateAdded: undefined,
      sortOrder: 0,
      imageUrl: '',
      imageFileName: null,
      diets: [],
      allergens: [],
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
    };
  }
  onImageUploaded(result: UploadResult) {
    this.item.update((current) => ({
      ...current,
      imageUrl: result.url,
      imageFileName: result.fileName,
    }));
  }

  onImageRemoved() {
    this.item.update((current) => ({
      ...current,
      imageUrl: '',
      imageFileName: '',
    }));
  }
}
