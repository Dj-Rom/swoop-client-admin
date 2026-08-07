// models/category.model.ts
export interface Category {
  id: string;
  name: string; // Вместо 'label'
  description?: string;
  menuTabId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
  itemsCount: number;
}

// Для создания новой категории
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  menuTabId?: string;
  sortOrder?: number;
}

// Для обновления категории
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  menuTabId?: string;
  sortOrder?: number;
}

// Для адаптации из бэкенда
export function adaptCategory(data: any): Category {
  return {
    id: data.id || data._id,
    name: data.name || data.label || 'Unnamed',
    description: data.description || '',
    menuTabId: data.menuTabId || data.menu_tab_id || data.menuTab,
    sortOrder: data.sortOrder || data.sort_order || 0,
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    updatedAt: data.updatedAt || data.updated_at,
    itemsCount: data.itemsCount || data.items_count || 0,
  };
}
