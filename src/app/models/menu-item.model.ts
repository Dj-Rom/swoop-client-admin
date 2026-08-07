// services/api/menu.ts
export interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  categoryName?: string;
  isAvailable: boolean;
  isStopList: boolean;
  stopListDateAdded?: string;
  sortOrder: number;
  imageUrl?: string;
  diets: string[];
  imageFileName?: string | null;
  allergens: string[];
  createdAt: string;
  updatedAt?: string;
  badgeLabel?: string; // Добавлено
}
