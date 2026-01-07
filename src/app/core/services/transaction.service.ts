import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
    transactionId: string;
    amount: number;
    transactionDate: string;
    status: string; // PENDING, PROCESSED
    rewardPoints: number;
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = '/api/v1/customers';

    constructor(private http: HttpClient) { }

    getTransactions(customerId: number, cardId: number, page: number = 0, size: number = 100): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<any>(`${this.apiUrl}/${customerId}/cards/${cardId}/transactions`, { params });
    }

    generateTransactions(customerId: number, cardId: number): Observable<void> {
        return this.http.post<void>(
            `${this.apiUrl}/${customerId}/cards/${cardId}/transactions/generate`,
            {}
        );
    }
}
