import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tag',
  standalone: true,
  templateUrl: './tag.html',
  styleUrl: './tag.scss',
  host: {
    '[class.active]': 'isSelected',
    '(click)': 'onClick()',
  },
})
export class Tag {
  @Input() disabled = false;
  @Input() label = '';
  @Input() isSelected = false;
  @Input() tag36 = false;
  @Output() selectedChange = new EventEmitter<boolean>();

  onClick() {
    this.isSelected = !this.isSelected;
    this.selectedChange.emit(this.isSelected);
  }
}
