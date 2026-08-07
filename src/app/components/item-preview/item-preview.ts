// components/item-preview/item-preview.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgIf, NgFor } from '@angular/common';
import { TagService } from '../../services/tag.service';
import { MenuItem } from '../../models/menu-item.model';

@Component({
  selector: 'app-item-preview',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe], // Удалите Tag из imports
  templateUrl: './item-preview.html',
  styleUrls: ['./item-preview.scss'],
})
export class ItemPreviewComponent {
  private tagService = inject(TagService);

  @Input() item!: MenuItem;

  get selectedDiets() {
    if (!this.item?.diets) return [];
    return this.tagService.getSelectedItems(this.tagService.diets(), this.item.diets);
  }

  get selectedAllergens() {
    if (!this.item?.allergens) return [];
    return this.tagService.getSelectedItems(this.tagService.allergens(), this.item.allergens);
  }
}
