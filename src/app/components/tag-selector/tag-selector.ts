import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag } from '../../components/ui/tag/tag';
import { TagItem, TagService } from '../../services/tag.service';

@Component({
  selector: 'app-tag-selector',
  standalone: true,
  imports: [CommonModule, Tag],
  templateUrl: './tag-selector.html',
  styleUrl: './tag-selector.scss',
})
export class TagSelectorComponent {
  private tagService = inject(TagService);

  @Input() title = '';
  @Input() items: TagItem[] = [];
  @Input() selected: string[] = [];
  @Input() tag36: boolean = false;
  @Output() selectedChange = new EventEmitter<string[]>();
  toggle(item: TagItem) {
    item.isSelected = !item.isSelected;

    const selected = this.items.filter((x) => x.isSelected).map((x) => x.id);

    this.selectedChange.emit(selected);
  }
}
