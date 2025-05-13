import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Worksheet model that matches the backend model
export interface Worksheet {
  id?: number;
  title: string;
  fileUrl: string;
  ageGroup: string;
  difficulty: string;
  categoryId: number;
  userId?: number;
}

export interface WorksheetData {
  title: string;
  fileUrl: string;
  ageGroup: string;
  difficulty: string;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  static handleError(err: unknown): string {
    throw new Error('Method not implemented.');
  }
  static saveWorksheet: any;
  static getPresignedUrl(name: string): { url: any; key: any; } | PromiseLike<{ url: any; key: any; }> {
    throw new Error('Method not implemented.');
  }
  static uploadFileToS3(url: any, file: File) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `https://server-drow.onrender.com/api/worksheets`;
  private uploadApiUrl = `https://server-drow.onrender.com/api/upload`;

  constructor(private http: HttpClient) { }

  /**
   * Creates a new worksheet as an admin user
   * @param worksheet The worksheet data to create
   * @returns An Observable containing the created worksheet
   */
  addWorksheetAsAdmin(worksheet: Worksheet): Observable<Worksheet> {
    return this.http.post<Worksheet>(`${this.apiUrl}/admin`, worksheet, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleHttpError));
  }

  /**
   * Gets a presigned URL for S3 upload
   * @param fileName The name of the file to upload
   * @returns A Promise containing the presigned URL response
   */
  getPresignedUrl(fileName: string): Promise<PresignedUrlResponse> {
    try {
      const url = `${this.uploadApiUrl}/presigned-url?fileName=${encodeURIComponent(fileName)}`;
      
      return this.http.get<PresignedUrlResponse>(url, { headers: this.getAuthHeaders() })
        .pipe(
          catchError(this.handleHttpError)
        )
        .toPromise()
        .then(response => {
          if (!response) {
            throw new Error('שגיאה בקבלת presigned URL');
          }
          return response;
        });
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Uploads a file directly to S3 using a presigned URL
   * @param url The presigned URL
   * @param file The file to upload
   * @returns A Promise that resolves when the upload is complete
   */
  uploadFileToS3(url: string, file: File): Promise<void> {
    try {
      return fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('שגיאה בהעלאת הקובץ');
        }
      });
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Saves a worksheet to the database
   * @param worksheetData The worksheet data to save
   * @returns A Promise that resolves when the worksheet is saved
   */
  saveWorksheet(worksheetData: WorksheetData): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      
      return this.http.post<void>(this.apiUrl, worksheetData, { headers })
        .pipe(
          catchError(this.handleHttpError)
        )
        .toPromise()
        .then(() => {
          return;
        });
    } catch (error) {
      console.error('Error saving worksheet:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Processes human-readable error messages
   * @param error The error object
   * @returns A string with a human-readable error message
   */
  handleError(error: unknown): string {
    console.error('Upload error:', error);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return 'שגיאת רשת: לא ניתן להתחבר לשרת. בדוק את החיבור לאינטרנט שלך.';
    }
    
    if (error instanceof Error) {
      switch (error.message) {
        case 'שגיאה בקבלת presigned URL':
          return 'שגיאה בהכנת ההעלאה. אנא נסה שוב מאוחר יותר.';
        case 'שגיאה בהעלאת הקובץ':
          return 'לא הצלחנו להעלות את הקובץ. אנא ודא שהקובץ תקין ונסה שוב.';
        case 'שגיאה בהוספת הקובץ לדאטה-בס':
          return 'הקובץ הועלה אך לא הצלחנו לשמור את הפרטים. אנא נסה שוב.';
        default:
          return `שגיאה בהעלאת הקובץ: ${error.message}`;
      }
    }
    
    return 'אירעה שגיאה לא צפויה. אנא נסה שוב מאוחר יותר.';
  }

  /**
   * Gets HTTP headers with authentication token
   * @returns HttpHeaders with Content-Type and Authorization
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Handles HTTP errors
   * @param error The HTTP error response
   * @returns An Observable error
   */
  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `שגיאת לקוח: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `קוד שגיאה: ${error.status}, הודעה: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}