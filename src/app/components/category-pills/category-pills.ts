import { CommonModule, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
  inject,
} from '@angular/core';

import { MenuService } from '../../services/api/menu';
import { FirstLetterUp } from '../../utils/helpers';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-pills',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './category-pills.html',
  styleUrl: './category-pills.scss',
})
export class CategoryPills {
  private menuService = inject(MenuService);

  @Input()
  categories: Category[] = [];

  @Input()
  activeCategoryId = '';

  @Output()
  categorySelected = new EventEmitter<string>();

  isAddCategory = signal(false);

  @ViewChild('categoryInput')
  categoryInput!: ElementRef<HTMLInputElement>;

  selectCategory(id: string) {
    this.categorySelected.emit(id);
  }

  onSaveNewCategory(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      return;
    }

    const value = this.categoryInput.nativeElement.value.trim();

    if (value.length > 1) {
      const label = FirstLetterUp(value);

      const newCategory: Category = {
        id: value.toLowerCase().replaceAll(' ', '-'),

        label,
      };

      this.menuService.addCategory(newCategory);
    }

    this.categoryInput.nativeElement.value = '';

    this.isAddCategory.set(false);
  }

  onAddNewCategory() {
    this.isAddCategory.set(true);

    setTimeout(() => {
      this.categoryInput?.nativeElement.focus();
    });
  }
}
