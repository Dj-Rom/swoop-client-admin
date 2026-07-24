import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface TagItem {
  id: string;
  label: string;
  shortLabel?: string;
  isSelected: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);

  private readonly defaultDiets: TagItem[] = [
    { id: 'vegan', label: 'Vegan', shortLabel: 'VG', isSelected: false },
    { id: 'vegetarian', label: 'Vegetarian', shortLabel: 'V', isSelected: false },
    { id: 'gluten-free', label: 'Gluten-Free', shortLabel: 'GF', isSelected: false },
    { id: 'keto', label: 'Keto', shortLabel: 'K', isSelected: false },
  ];

  private readonly defaultAllergens: TagItem[] = [
    { id: 'eggs', label: 'Eggs', isSelected: false },
    { id: 'fish', label: 'Fish', isSelected: false },
    { id: 'peanuts', label: 'Peanuts', isSelected: false },
    { id: 'soybeans', label: 'Soybeans', isSelected: false },
    { id: 'milk', label: 'Milk (lactose)', isSelected: false },
    { id: 'nuts', label: 'Nuts', isSelected: false },
    { id: 'celery', label: 'Celery', isSelected: false },
    { id: 'mustard', label: 'Mustard', isSelected: false },
    { id: 'sesame', label: 'Sesame seeds', isSelected: false },
    { id: 'molluscs', label: 'Molluscs', isSelected: false },
  ];

  getDiets(): Observable<TagItem[]> {
    return of(this.defaultDiets);
  }

  getAllergens(): Observable<TagItem[]> {
    return of(this.defaultAllergens);
  }

  toggleTag(selected: string[], id: string): string[] {
    return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
  }

  mapSelection(items: TagItem[], selected: string[]): TagItem[] {
    return items.map((item) => ({
      ...item,
      isSelected: selected.includes(item.id),
    }));
  }

  getSelectedItems(items: TagItem[], selected: string[]): TagItem[] {
    return this.mapSelection(items, selected).filter((item) => item.isSelected);
  }
}
