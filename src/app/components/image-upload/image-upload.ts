// image-upload.component.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ImageUploadService, UploadResult } from '../../services/image-upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUploadComponent {
  private imageUploadService = inject(ImageUploadService);

  // Текущее изображение (URL для отображения)
  @Input() currentImageUrl: string | null = null;
  // Имя файла (для удаления, если нужно)
  @Input() currentFileName: string | null = null;

  // События для родителя
  @Output() imageUploaded = new EventEmitter<UploadResult>();
  @Output() imageRemoved = new EventEmitter<void>();

  isLoading = false;
  errorMessage: string | null = null;

  // Обработчик выбора файла
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Валидация размера и типа
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.size > maxSize) {
      this.errorMessage = 'File size exceeds 10 MB limit.';
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Invalid file type. Allowed: JPEG, PNG, WEBP, GIF.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    try {
      // ✅ Используем сервис для загрузки
      const result = await firstValueFrom(this.imageUploadService.uploadImage(file));
      if (result) {
        this.currentImageUrl = result.url;
        this.currentFileName = result.fileName;
        this.imageUploaded.emit(result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.errorMessage = 'Failed to upload image. Please try again.';
    } finally {
      this.isLoading = false;
      input.value = ''; // Сбрасываем input
    }
  }

  // ❌ УДАЛЯЕМ дублирующий метод uploadImage – он уже есть в сервисе

  // Удаление текущего изображения
  removeImage(): void {
    if (!this.currentImageUrl) return;

    // Если нужно удалить с сервера, можно вызвать отдельный метод
    // this.imageUploadService.deleteImage(this.currentFileName).subscribe(...)

    this.currentImageUrl = null;
    this.currentFileName = null;
    this.errorMessage = null;
    this.imageRemoved.emit();
  }
}
