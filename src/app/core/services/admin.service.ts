import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = '/api/v1/admin/ces-users';

    constructor(private http: HttpClient) { }

    createCesUser(user: any): Observable<void> {
        return this.http.post<void>(this.apiUrl, user);
    }

    deleteCesUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }
}
