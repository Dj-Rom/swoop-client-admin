import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DishTableGroup } from '../dish-table-group/dish-table-group';
import { Dish } from '../dish-row/dish-row';

export interface DishGroup {
  id: string;
  title: string;
  dishes: Dish[];
}

@Component({
  selector: 'app-dish-table',
  standalone: true,
  imports: [CommonModule, DishTableGroup],
  templateUrl: './dish-table.html',
  styleUrl: './dish-table.scss',
})
export class DishTable {
  @Input() groups: DishGroup[] = [];
  @Output() stopListToggled = new EventEmitter<{ dishId: string; checked: boolean }>();
  @Output() dishesReordered = new EventEmitter<{ groupId: string; dishes: Dish[] }>();
}
