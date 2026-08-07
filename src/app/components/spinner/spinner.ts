// components/spinner/spinner.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrapper" [style.gap]="gap">
      <div
        class="spinner"
        [style.width]="size"
        [style.height]="size"
        [style.border-width]="borderWidth"
        [style.border-color]="borderColor"
        [style.border-top-color]="borderTopColor"
      ></div>
      <span *ngIf="text" class="spinner-text" [style.color]="textColor">{{ text }}</span>
    </div>
  `,
  styles: [
    `
      .spinner-wrapper {
        display: inline-flex;
        align-items: center;
      }
      .spinner {
        border-style: solid;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .spinner-text {
        font-size: 0.875rem;
        margin-left: 0.5rem;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {
  @Input() size: string = '20px';
  @Input() borderWidth: string = '2px';
  @Input() borderColor: string = '#e5e7eb';
  @Input() borderTopColor: string = '#3b82f6';
  @Input() text: string = '';
  @Input() textColor: string = '#6b7280';
  @Input() gap: string = '0.5rem';
}
