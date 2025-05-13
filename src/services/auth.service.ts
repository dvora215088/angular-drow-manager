import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// הגדרת המודל של משתמש
interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://server-drow.onrender.com/api/auth/admin-login'; // ה-API לניהול התחברות

  constructor(private http: HttpClient) {}

  // פונקציה להתחבר כמנהל
  loginAsAdmin(email: string, password: string): Observable<AuthResponse> {
    const loginDto = { email, password };

    return this.http.post<AuthResponse>(this.apiUrl, loginDto);
  }

}
