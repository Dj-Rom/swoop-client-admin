import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { NgIf, NgFor } from '@angular/common';
import { TagService, TagItem } from '../../services/tag.service';
import { Tag } from '../ui/tag/tag';

@Component({
  selector: 'app-item-preview',
  standalone: true,
  imports: [NgIf, NgFor, Tag],
  templateUrl: './item-preview.html',
  styleUrl: './item-preview.scss',
})
export class ItemPreviewComponent implements OnChanges {
  @Input() item!: MenuItem;

  selectedDiets: TagItem[] = [];
  selectedAllergens: TagItem[] = [];
  tagService = inject(TagService);
  ngOnChanges(changes: SimpleChanges) {
    if (changes['item']) {
      console.log('PREVIEW ITEM:', this.item);

      this.loadTags();
    }
  }

  loadTags() {
    this.tagService.getDiets().subscribe((diets) => {
      this.selectedDiets = this.tagService.getSelectedItems(diets, this.item.diets);
    });

    this.tagService.getAllergens().subscribe((allergens) => {
      this.selectedAllergens = this.tagService.getSelectedItems(allergens, this.item.allergens);
    });
  }
}
