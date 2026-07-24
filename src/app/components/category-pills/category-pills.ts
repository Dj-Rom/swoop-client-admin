import { CommonModule, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { MenuService } from '../../services/api/menu';
import { FirstLetterUp } from '../../utils/helpers';
export interface Category {
  id: string;
  label: string;
}

@Component({
  selector: 'app-category-pills',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './category-pills.html',
  styleUrl: './category-pills.scss',
})
export class CategoryPills {
  constructor(public menuService: MenuService) {}
  isAddCategory = signal(false);
  @ViewChild('categoryInput') categoryInput!: ElementRef<HTMLInputElement>;
  onSaveNewCategory(event: KeyboardEvent) {
    if (event?.key == 'Enter') {
      let valueStr = this.categoryInput.nativeElement.value.trim().toString();
      if (valueStr.length > 1) {
        let newCategory = {
          id: valueStr.toLowerCase(),
          label: FirstLetterUp(valueStr),
        };
        this.menuService.addCategory(newCategory);
      }
      this.categoryInput.nativeElement.value = '';
      this.isAddCategory.set(false);
    }
  }

  onAddNewCategory() {
    this.isAddCategory.set(true);
    setTimeout(() => {
      this.categoryInput.nativeElement.focus();
    });
  }

  @Input() categories: Category[] = [];
  @Input() activeCategoryId = '';
  @Output() categorySelected = new EventEmitter<string>();
  @Output() addCategory = new EventEmitter<void>();
}
