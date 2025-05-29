import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, tap, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorksheetService {
  private readonly baseUrl = 'https://server-drow.onrender.com';

  // Cache המידע
  private worksheetsCache$ = new BehaviorSubject<any[]>([]);
  private isCacheLoaded = false;
  private cachedHeaders: HttpHeaders | null = null;
  private lastToken: string | null = null;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const currentToken = localStorage.getItem('token');
    
    // יצירה חדשה רק אם הטוקן השתנה
    if (this.lastToken !== currentToken || !this.cachedHeaders) {
      this.lastToken = currentToken;
      this.cachedHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`
      });
    }
    
    return this.cachedHeaders;
  }

  // פונקציה לקבלת כל דפי העבודה עם דירוגים - עם מטמון
  getAllWorksheetsWithRatings(): Observable<any[]> {
    // אם יש כבר מידע במטמון, החזר אותו
    if (this.isCacheLoaded && this.worksheetsCache$.value.length > 0) {
      console.log('משתמש במידע worksheets מהמטמון');
      return this.worksheetsCache$.asObservable();
    }

    // אם עדיין לא טענו, טען מהשרת
    if (!this.isCacheLoaded) {
      this.loadWorksheetsFromServer();
    }

    return this.worksheetsCache$.asObservable();
  }

  private loadWorksheetsFromServer(): void {
    const headers = this.getAuthHeaders();
    
    this.http.get<any[]>(`${this.baseUrl}/api/worksheets/admin/all-with-ratings`, { headers })
      .pipe(
        tap(worksheets => {
          console.log('מידע worksheets נטען מהשרת:', worksheets.length, 'דפים');
          this.worksheetsCache$.next(worksheets);
          this.isCacheLoaded = true;
        }),
        shareReplay(1)
      )
      .subscribe({
        error: (error) => {
          console.error('שגיאה בטעינת דפי העבודה:', error);
          this.isCacheLoaded = true;
        }
      });
  }

  // פונקציה לעדכון דף עבודה - עם עדכון מטמון
  updateWorksheet(id: number, updatedWorksheet: any): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<any>(`${this.baseUrl}/api/worksheets/${id}`, updatedWorksheet, { headers })
      .pipe(
        tap(updated => {
          // עדכן את המטמון
          const currentWorksheets = this.worksheetsCache$.value;
          const index = currentWorksheets.findIndex(w => w.id === id);
          
          if (index !== -1) {
            const newWorksheets = [...currentWorksheets];
            newWorksheets[index] = { ...newWorksheets[index], ...updated };
            this.worksheetsCache$.next(newWorksheets);
            console.log('עודכן במטמון worksheet:', id);
          }
        })
      );
  }

  // פונקציה למחיקת דף עבודה - עם עדכון מטמון
  deleteWorksheet(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete<void>(`${this.baseUrl}/api/worksheets/${id}`, { headers })
      .pipe(
        tap(() => {
          // הסר מהמטמון
          const currentWorksheets = this.worksheetsCache$.value;
          const filteredWorksheets = currentWorksheets.filter(w => w.id !== id);
          this.worksheetsCache$.next(filteredWorksheets);
          console.log('נמחק מהמטמון worksheet:', id);
        })
      );
  }

  // פונקציה ליצירת דף עבודה חדש (אם תצטרך)
  createWorksheet(worksheet: any): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<any>(`${this.baseUrl}/api/worksheets`, worksheet, { headers })
      .pipe(
        tap(newWorksheet => {
          // הוסף למטמון
          const currentWorksheets = this.worksheetsCache$.value;
          this.worksheetsCache$.next([...currentWorksheets, newWorksheet]);
          console.log('נוסף למטמון worksheet חדש:', newWorksheet.id);
        })
      );
  }

  // מתודות עזר לניהול המטמון
  refreshCache(): void {
    console.log('רענון מטמון worksheets');
    this.isCacheLoaded = false;
    this.worksheetsCache$.next([]);
    this.loadWorksheetsFromServer();
  }

  clearCache(): void {
    console.log('ניקוי מטמון worksheets');
    this.isCacheLoaded = false;
    this.worksheetsCache$.next([]);
  }

  // בדוק אם המטמון טעון
  get isCached(): boolean {
    return this.isCacheLoaded;
  }

  // קבל את המידע הנוכחי מהמטמון
  get currentWorksheets(): any[] {
    return this.worksheetsCache$.value;
  }

  // קבל worksheet ספציפי מהמטמון
  getWorksheetById(id: number): Observable<any> {
    const cachedWorksheet = this.worksheetsCache$.value.find(w => w.id === id);
    if (cachedWorksheet) {
      return of(cachedWorksheet);
    }
    
    // אם לא נמצא במטמון, טען מהשרת
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}/api/worksheets/${id}`, { headers });
  }

  // ניקוי מטמון headers
  clearHeadersCache(): void {
    this.cachedHeaders = null;
    this.lastToken = null;
  }

  // פונקציות נוספות שעשויות להיות שימושיות
  
  // קבל worksheets לפי קטגוריה מהמטמון
  getWorksheetsByCategory(categoryId: number): Observable<any[]> {
    if (this.isCacheLoaded) {
      const filtered = this.worksheetsCache$.value.filter(w => w.categoryId === categoryId);
      return of(filtered);
    }
    
    // אם אין מטמון, קודם טען הכל ואז סנן
    return this.getAllWorksheetsWithRatings().pipe(
      tap(() => {}), // המתנה לטעינה
      tap(() => {
        const filtered = this.worksheetsCache$.value.filter(w => w.categoryId === categoryId);
        return of(filtered);
      })
    );
  }

  // עדכון דירוג לdף עבודה
  updateWorksheetRating(worksheetId: number, rating: number): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<any>(`${this.baseUrl}/api/worksheets/${worksheetId}/rating`, 
      { rating }, 
      { headers }
    ).pipe(
      tap(response => {
        // עדכן את הדירוג במטמון
        const currentWorksheets = this.worksheetsCache$.value;
        const index = currentWorksheets.findIndex(w => w.id === worksheetId);
        
        if (index !== -1) {
          const newWorksheets = [...currentWorksheets];
          newWorksheets[index] = { 
            ...newWorksheets[index], 
            averageRating: response.averageRating,
            totalRatings: response.totalRatings
          };
          this.worksheetsCache$.next(newWorksheets);
          console.log('עודכן דירוג במטמון worksheet:', worksheetId);
        }
      })
    );
  }
}