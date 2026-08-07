// user-avatar.component.ts
import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-avatar" [class]="sizeClass" [style.width.px]="size" [style.height.px]="size">
      <img
        *ngIf="avatarUrl"
        [src]="avatarUrl"
        [alt]="userName()"
        class="avatar-image"
        (error)="handleImageError()"
      />
      <div *ngIf="!avatarUrl" class="avatar-placeholder" [style.fontSize.px]="fontSize">
        {{ initials() }}
      </div>
      <div *ngIf="showStatus" class="status-dot" [class.online]="isOnline"></div>
    </div>
  `,
  styles: [
    `
      .user-avatar {
        position: relative;
        display: inline-block;
        flex-shrink: 0;
        border-radius: 50%;
        overflow: hidden;
      }

      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        background: #e2e8f0;
      }

      .status-dot.online {
        background: #48bb78;
      }

      .size-sm {
        width: 32px;
        height: 32px;
      }

      .size-md {
        width: 48px;
        height: 48px;
      }

      .size-lg {
        width: 64px;
        height: 64px;
      }

      .size-xl {
        width: 96px;
        height: 96px;
      }

      .size-xxl {
        width: 128px;
        height: 128px;
      }
    `,
  ],
})
export class UserAvatarComponent {
  private userService = inject(UserService);

  @Input() userId?: string;
  @Input() name?: string;
  @Input() avatarUrl?: string;
  @Input() size: number = 48;
  @Input() showStatus: boolean = false;
  @Input() isOnline: boolean = false;
  @Input() sizeClass: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md';

  userName = computed(() => {
    if (this.name) return this.name;
    return this.userService.userName();
  });

  // ✅ Fix: initials is now a computed property (not a function)
  initials = computed(() => {
    const name = this.userName();
    if (!name || name === 'Guest') return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  get fontSize(): number {
    return this.size / 2.5;
  }

  handleImageError(): void {
    console.log('[UserAvatar] Image failed to load, using placeholder');
    this.avatarUrl = '';
  }
}
