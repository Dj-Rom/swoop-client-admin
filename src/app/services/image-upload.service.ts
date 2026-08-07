// image-upload.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadResult {
  url: string;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl; // используем реальный URL из окружения

  /**
   * Загружает файл на сервер (S3) и возвращает URL и имя файла
   */
  uploadImage(file: File): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<UploadResult>(`${this.apiUrl}/upload/photo`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Удаляет файл по имени (fileName)
   */
  deleteImage(fileName: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/upload/photo/${fileName}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * (Опционально) Читает файл локально в Data URL, если нужно показать превью до загрузки.
   * Этот метод можно оставить для других целей.
   */
  readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[ImageUploadService]', error);
    return throwError(() => new Error(error.message || 'Image operation failed.'));
  }
}
