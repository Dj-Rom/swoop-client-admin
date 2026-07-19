import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchInput } from '../ui/search-input/search-input';

@Component({
  selector: 'app-structure-header',
  standalone: true,
  imports: [SearchInput],
  templateUrl: './structure-header.html',
  styleUrl: './structure-header.scss',
})
export class StructureHeader {
  @Input() title = 'Structure';
  @Output() search = new EventEmitter<string>();
  @Output() addNew = new EventEmitter<void>();
}
