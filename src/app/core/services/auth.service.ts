import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/v1/auth';
    private userSubject = new BehaviorSubject<any | null>(null);
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromStorage();
    }

    login(credentials: { username: string; password: string }): Observable<any> {
        return this.http.post<{ token: string; role: string; username: string }>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    localStorage.setItem('token', response.token);
                    // Backend might not return full user object, so we decode or store what we have
                    const user = { username: credentials.username, role: response.role || 'CES' }; // Fallback if role missing in response
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                })
            );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        const user = this.userSubject.value;
        return user?.role === 'ADMIN_CES' || user?.role === 'ADMIN';
    }

    private loadUserFromStorage() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.userSubject.next(JSON.parse(userStr));
        }
    }
}
