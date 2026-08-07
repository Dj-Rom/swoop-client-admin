// components/global-loader/global-loader.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpinnerComponent } from '../spinner/spinner';
import { LoaderService } from '../../services/loader';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div *ngIf="loaderService.loading()" class="global-loader-overlay">
      <div class="global-loader-content">
        <app-spinner
          size="48px"
          borderWidth="4px"
          borderColor="#e5e7eb"
          borderTopColor="#3b82f6"
          [text]="loaderService.text()"
          textColor="#ffffff"
        ></app-spinner>
      </div>
    </div>
  `,
  styles: [
    `
      .global-loader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .global-loader-content {
        background: rgba(30, 30, 30, 0.85);
        padding: 2rem 3rem;
        border-radius: 1rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    `,
  ],
})
export class GlobalLoaderComponent {
  loaderService = inject(LoaderService);
}
