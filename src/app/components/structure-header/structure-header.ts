import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchInput } from '../ui/search-input/search-input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}
  addNew() {
    this.router.navigate(['add-new'], { relativeTo: this.route });
  }
}
