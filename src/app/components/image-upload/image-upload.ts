import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUploadComponent {
  private imageUploadService = inject(ImageUploadService);

  private _images: string[] = [];

  @Input()
  set images(val: string[] | undefined | null) {
    this._images = val || [];
  }
  get images(): string[] {
    return this._images;
  }

  @Output() imagesChange = new EventEmitter<string[]>();
  @Output() changed = new EventEmitter<string>();

  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    try {
      // 1. Konwersja lokalna do Data URL
      const newImg = await this.imageUploadService.readFileAsDataUrl(file);

      // Jeśli chcesz używać bezpośrednio z backendem, użyj:
      // const newImg = await firstValueFrom(this.imageUploadService.uploadImage(file));

      const updatedImages = [...this.images, newImg];

      // Aktualizacja stanu i powiadomienie rodzica
      this.images = updatedImages;
      this.imagesChange.emit(updatedImages);
      this.changed.emit(newImg);
    } catch (error) {
      console.error('Błąd podczas dodawania zdjęcia:', error);
    } finally {
      input.value = ''; // Reset inputu pliku
    }
  }

  removeImage(index: number): void {
    const updatedImages = this.images.filter((_, i) => i !== index);

    this.images = updatedImages;
    this.imagesChange.emit(updatedImages);

    // Jeśli usunięto ostatnie zdjęcie, wyślij pusty string do zmiennej pojedynczej
    if (updatedImages.length === 0) {
      this.changed.emit('');
    }
  }
}
