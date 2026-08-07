import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { Tag } from '../ui/tag/tag';
import { Badge } from '../ui/badge/badge';
import { ToggleSwitch } from '../ui/toggle-switch/toggle-switch';
import { MenuService } from '../../services/api/menu';
export interface Dish {
  id: string;
  imageUrl?: string; // Изменено: image -> imageUrl
  title: string;
  description: string;
  price: string;
  diets: string[];
  allergens: string[];
  inStopList: boolean;
  badgeLabel?: string;
}

@Component({
  selector: 'app-dish-row',
  standalone: true,
  imports: [CommonModule, CdkDragHandle, Tag, Badge, ToggleSwitch],
  templateUrl: './dish-row.html',
  styleUrl: './dish-row.scss',
})
export class DishRow {
  menuService = inject(MenuService);
  @Input({ required: true }) dish!: Dish;
  @Output() stopListToggled = new EventEmitter<boolean>();

  onToggle(checked: boolean): void {
    this.stopListToggled.emit(checked);
  }
  onDelete(id: string): void {
    this.menuService.deleteMenuItem(id).subscribe({
      next: () => {
        console.log(`Menu item with ID ${id} deleted successfully.`);
        // Optionally, you can emit an event or update the UI to reflect the deletion.
      },
      error: (error) => {
        console.error(`Error deleting menu item with ID ${id}:`, error);
        // Optionally, handle the error (e.g., show a notification to the user).
      },
    });
  }
}
