import { Category } from './category.model';

// models/menu.model.ts
export interface Menu {
  id: string;
  name: string;
  description?: string;
  isActive: boolean; // Вместо 'active'
  sortOrder: number;
  createdAt: string; // Вместо 'dateCreated'
  updatedAt?: string;
}

// Используйте этот интерфейс в MenuTabs компоненте
export interface MenuTab {
  id: string;
  name: string;
  menuId: string;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
  categories?: Category[];
}
export interface MenuTabItem {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sortOrder?: number;
}
