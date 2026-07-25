import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MenuItem } from '../../models/menu-item.model';
import { ToggleSwitch } from '../../components/ui/toggle-switch/toggle-switch';
import { Tag } from '../ui/tag/tag';
import { MenuService } from '../../services/api/menu';

@Component({
  selector: 'app-stop-list-table-row',
  standalone: true,
  imports: [CommonModule, DecimalPipe, Tag, ToggleSwitch],
  templateUrl: './stop-list-table-row.html',
  styleUrl: './stop-list-table-row.scss',
})
export class StopListTableRow {
  constructor(public menuService: MenuService) {}

  @Input() item!: MenuItem;

  @Output() stopListToggled = new EventEmitter<{
    dishId: string;
    checked: boolean;
  }>();

  onStopListToggled(checked: boolean): void {
    checked
      ? this.menuService.addToStopList(this.item.id)
      : this.menuService.removeFromStopList(this.item.id);

    this.stopListToggled.emit({
      dishId: this.item.id,
      checked,
    });
  }
}
