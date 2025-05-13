import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorksheetService {
  private readonly baseUrl = 'https://server-drow.onrender.com';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // פונקציה לקבלת כל דפי העבודה עם דירוגים
  getAllWorksheetsWithRatings(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/api/worksheets/admin/all-with-ratings`, { headers });
  }

  // פונקציה לעדכון דף עבודה
  updateWorksheet(id: number, updatedWorksheet: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${this.baseUrl}/api/worksheets/${id}`, updatedWorksheet, { headers });
  }

  // פונקציה למחיקת דף עבודה
  deleteWorksheet(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/api/worksheets/${id}`, { headers });
  }
}
