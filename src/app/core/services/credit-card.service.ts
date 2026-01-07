import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreditCard {
    id: number;
    cardNumber: string;
    maskedCardNumber?: string;
    cardType: string;
    expiryDate: string;
    status: 'LINKED' | 'UNLINKED';
    active?: boolean; // Deprecated, use status instead
}

@Injectable({
    providedIn: 'root'
})
export class CreditCardService {
    private apiUrl = '/api/v1/customers';

    constructor(private http: HttpClient) { }

    getCards(customerId: number, includeUnlinked: boolean = false): Observable<CreditCard[]> {
        return this.http.get<CreditCard[]>(`${this.apiUrl}/${customerId}/cards`, {
            params: { includeUnlinked: includeUnlinked.toString() }
        });
    }

    linkCard(customerId: number, cardData: any): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${customerId}/cards`, cardData);
    }

    unlinkCard(customerId: number, cardId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${customerId}/cards/${cardId}`);
    }
}
