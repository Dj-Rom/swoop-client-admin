import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
})
export class SearchInput {
  @Input() placeholder = 'Search';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(newValue: string): void {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }
}
