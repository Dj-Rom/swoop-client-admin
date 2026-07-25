import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { DishRow, Dish } from '../dish-row/dish-row';

@Component({
  selector: 'app-dish-table-group',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, DishRow, CdkDragPlaceholder],
  templateUrl: './dish-table-group.html',
  styleUrl: './dish-table-group.scss',
})
export class DishTableGroup {
  @Input() groupTitle = '';
  @Input() dishes: Dish[] = [];
  @Output() stopListToggled = new EventEmitter<{ dishId: string; checked: boolean }>();
  @Output() dishesReordered = new EventEmitter<Dish[]>();

  onToggle(dishId: string, checked: boolean): void {
    this.stopListToggled.emit({ dishId, checked });
  }

  onDrop(event: CdkDragDrop<Dish[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const reordered = [...this.dishes];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.dishes = reordered;
    this.dishesReordered.emit(reordered);
  }
}
