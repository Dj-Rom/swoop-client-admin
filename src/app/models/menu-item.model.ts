export interface MenuItem {
  id: string;
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
