import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuService } from '../../../services/api/menu';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  templateUrl: './toggle-switch.html',
  styleUrl: './toggle-switch.scss',
})
export class ToggleSwitch {
  @Input() checked = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.checked = !this.checked;

    this.checkedChange.emit(this.checked);
  }
}
