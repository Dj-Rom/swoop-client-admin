import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { Tag } from '../ui/tag/tag';
import { Badge } from '../ui/badge/badge';
import { ToggleSwitch } from '../ui/toggle-switch/toggle-switch';

export interface Dish {
  id: string;
  image: string;
  title: string;
  badgeLabel?: string; // 'Popular' | 'New' | undefined
  description: string;
  price: string;
  diets: string[]; // e.g. ['Ve', 'Ve']
  allergens: string[]; // e.g. ['Al', 'Eg']
  inStopList: boolean;
}

@Component({
  selector: 'app-dish-row',
  standalone: true,
  imports: [CommonModule, CdkDragHandle, Tag, Badge, ToggleSwitch],
  templateUrl: './dish-row.html',
  styleUrl: './dish-row.scss',
})
export class DishRow {
  @Input({ required: true }) dish!: Dish;
  @Output() stopListToggled = new EventEmitter<boolean>();

  onToggle(checked: boolean): void {
    this.stopListToggled.emit(checked);
  }
}
