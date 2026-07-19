import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag',
  standalone: true,
  templateUrl: './tag.html',
  styleUrl: './tag.scss',
})
export class Tag {
  @Input() label = '';
  @Input() disabled = false;
}
