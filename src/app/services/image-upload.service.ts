import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.example.com/images'; // Replace with your endpoint

  /**
   * Uploads file to backend API
   */
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file, file.name);

    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData).pipe(
      map((res) => res.url),
      catchError(this.handleError),
    );
  }
  getImages(): Observable<string[]> {
    return this.http.get<{ images: string[] }>(`${this.apiUrl}`).pipe(
      map((res) => res.images),
      catchError(this.handleError),
    );
  }
  /**
   * Reads file locally into Base64 / Data URL string
   */
  readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  deleteImage(imageUrl: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/delete`, {
        body: { url: imageUrl },
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('[ImageUploadService]', error);
    return throwError(() => new Error(error.message || 'Image upload failed.'));
  }
}
