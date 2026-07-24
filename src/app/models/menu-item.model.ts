export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  diets: string[];
  allergens: string[];
  image?: string; // Add this line (or string[] if you support multiple)
}
