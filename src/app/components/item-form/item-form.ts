import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { TagSelectorComponent } from '../tag-selector/tag-selector';
import { TagItem } from '../../services/tag.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [TagSelectorComponent],
  templateUrl: './item-form.html',
  styleUrl: './item-form.scss',
})
export class ItemFormComponent implements OnChanges {
  @Input() diets: TagItem[] = [];
  @Input() allergens: TagItem[] = [];
  @Input() item!: MenuItem;

  @Output() itemChange = new EventEmitter<Partial<MenuItem>>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['diets']) {
      console.log('FORM DIETS:', this.diets);
    }

    if (changes['allergens']) {
      console.log('FORM ALLERGENS:', this.allergens);
    }
  }
  change(field: keyof MenuItem, value: any) {
    console.log('FIELD CHANGE:', field, value);

    this.itemChange.emit({
      [field]: value,
    });
  }

  updateItem(data: Partial<MenuItem>) {
    console.log('ITEM FORM UPDATE:', data);
    this.itemChange.emit(data);
  }
}
