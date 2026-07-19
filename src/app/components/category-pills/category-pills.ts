import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Category {
  id: string;
  label: string;
}

@Component({
  selector: 'app-category-pills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-pills.html',
  styleUrl: './category-pills.scss',
})
export class CategoryPills {
  @Input() categories: Category[] = [];
  @Input() activeCategoryId = '';
  @Output() categorySelected = new EventEmitter<string>();
  @Output() addCategory = new EventEmitter<void>();
}
