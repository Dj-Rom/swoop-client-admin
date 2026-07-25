import { Component, computed, inject, Input } from '@angular/core';
import { MenuItem } from '../../../models/menu-item.model';
import { StopListTableRow } from '../../../components/stop-list-table-row/stop-list-table-row';
import { NgFor, NgIf } from '@angular/common';
import { MenuService } from '../../../services/api/menu';
import { Breadcrumbs } from '../../../components/breadcrumbs/breadcrumbs';
@Component({
  selector: 'app-stop-list',
  imports: [StopListTableRow, NgFor, Breadcrumbs, NgIf],
  templateUrl: './stop-list.html',
  styleUrl: './stop-list.scss',
})
export class StopList {
  private menuService = inject(MenuService);
  stopListItems = computed(() => this.menuService.menuItems().filter((item) => item.stopList));
}
