// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, tap, shareReplay } from 'rxjs';

export interface Category {
  id: number;
  categoryName: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'https://server-drow.onrender.com/api/categories';
  
  // Cache המידע
  private categoriesCache$ = new BehaviorSubject<Category[]>([]);
  private isCacheLoaded = false;
  private cachedHeaders: HttpHeaders | null = null;
  private lastToken: string | null = null;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const currentToken = localStorage.getItem('token');
    
    if (this.lastToken !== currentToken || !this.cachedHeaders) {
      this.lastToken = currentToken;
      this.cachedHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`
      });
    }
    
    return this.cachedHeaders;
  }

  // המתודה הראשית - תטען רק פעם אחת
  getAllCategories(): Observable<Category[]> {
    // אם יש כבר מידע במטמון, החזר אותו
    if (this.isCacheLoaded && this.categoriesCache$.value.length > 0) {
      return this.categoriesCache$.asObservable();
    }

    // אם עדיין לא טענו, טען מהשרת
    if (!this.isCacheLoaded) {
      this.loadCategoriesFromServer();
    }

    return this.categoriesCache$.asObservable();
  }

  private loadCategoriesFromServer(): void {
    this.http.get<Category[]>(this.baseUrl)
      .pipe(
        tap(categories => {
          this.categoriesCache$.next(categories);
          this.isCacheLoaded = true;
        }),
        shareReplay(1) // שמור את התוצאה למי שמגיע מאוחר
      )
      .subscribe({
        error: (error) => {
          console.error('שגיאה בטעינת קטגוריות:', error);
          this.isCacheLoaded = true; // גם במקרה של שגיאה, לא ננסה שוב
        }
      });
  }

  getCategoryById(id: number): Observable<Category> {
    // בדוק במטמון קודם
    const cachedCategory = this.categoriesCache$.value.find(cat => cat.id === id);
    if (cachedCategory) {
      return of(cachedCategory);
    }
    
    // אם לא נמצא במטמון, טען מהשרת
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, category, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(newCategory => {
        // עדכן את המטמון
        const currentCategories = this.categoriesCache$.value;
        this.categoriesCache$.next([...currentCategories, newCategory]);
      })
    );
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, category, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(updatedCategory => {
        // עדכן את המטמון
        const currentCategories = this.categoriesCache$.value;
        const index = currentCategories.findIndex(c => c.id === id);
        if (index !== -1) {
          const newCategories = [...currentCategories];
          newCategories[index] = updatedCategory;
          this.categoriesCache$.next(newCategories);
        }
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // עדכן את המטמון
        const currentCategories = this.categoriesCache$.value;
        const filteredCategories = currentCategories.filter(c => c.id !== id);
        this.categoriesCache$.next(filteredCategories);
      })
    );
  }

  // מתודות עזר לניהול המטמון
  refreshCache(): void {
    this.isCacheLoaded = false;
    this.categoriesCache$.next([]);
    this.loadCategoriesFromServer();
  }

  clearCache(): void {
    this.isCacheLoaded = false;
    this.categoriesCache$.next([]);
  }

  // בדוק אם המטמון טעון
  get isCached(): boolean {
    return this.isCacheLoaded;
  }

  // קבל את המידע הנוכחי מהמטמון
  get currentCategories(): Category[] {
    return this.categoriesCache$.value;
  }

  clearHeadersCache(): void {
    this.cachedHeaders = null;
    this.lastToken = null;
  }
}