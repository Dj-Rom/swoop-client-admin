import { Component, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { TagItem, TagService } from '../../../../services/tag.service';
import { MenuItem } from '../../../../models/menu-item.model';
import { ItemFormComponent } from '../../../../components/item-form/item-form';
import { ImageUploadComponent } from '../../../../components/image-upload/image-upload';
import { ItemPreviewComponent } from '../../../../components/item-preview/item-preview';
import { Breadcrumbs } from '../../../../components/breadcrumbs/breadcrumbs';
@Component({
  selector: 'app-add-new-item-page',
  standalone: true,
  imports: [ItemFormComponent, ImageUploadComponent, ItemPreviewComponent, Breadcrumbs],
  templateUrl: './add-new-item-menu.html',
  styleUrl: './add-new-item-menu.scss',
})
export class AddNewItemMenu implements OnInit {
  diets: WritableSignal<TagItem[]> = signal([]);
  allergens: WritableSignal<TagItem[]> = signal([]);

  constructor(private tagService: TagService) {}

  ngOnInit() {
    this.tagService.getDiets().subscribe((data) => {
      this.diets.set(data);
    });

    this.tagService.getAllergens().subscribe((data) => {
      this.allergens.set(data);
    });
  }

  item: MenuItem = {
    id: '',
    name: '',
    description: '',

    price: 0,
    diets: [],
    allergens: [],
    dateAdded: '22-07-2026 10:00',
    stopList: false,
  };

  updateItem(data: Partial<MenuItem>) {
    this.item = {
      ...this.item,
      ...data,
    };
  }
  save() {}
}
