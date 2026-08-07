// pages/menu/stop-list/stop-list.ts
import { Component, computed, inject } from '@angular/core';
import { MenuService } from '../../../services/api/menu';
import { StopListTableRow } from '../../../components/stop-list-table-row/stop-list-table-row';
import { NgFor, NgIf } from '@angular/common';
import { Breadcrumbs } from '../../../components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-stop-list',
  standalone: true,
  imports: [StopListTableRow, NgFor, Breadcrumbs, NgIf],
  templateUrl: './stop-list.html',
  styleUrl: './stop-list.scss',
})
export class StopList {
  private menuService = inject(MenuService);

  stopListItems = computed(
    () => this.menuService.menuItems().filter((item) => item.isStopList), // Используем isStopList
  );
}
