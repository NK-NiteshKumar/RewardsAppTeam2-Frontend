import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RewardItem {
    id: number;
    name: string;
    category: string;
    pointsCost: number;
    // mapped image
    imageUrl?: string;
}

export interface RewardCartItem {
    rewardItemId: number;
    name: string;
    quantity: number;
    pointsCost: number;
    totalPoints: number;
}

export interface RewardCart {
    customerId: number;
    items: RewardCartItem[];
    totalPoints: number;
}

@Injectable({
    providedIn: 'root'
})
export class RewardService {
    constructor(private http: HttpClient) { }

    getRewardCatalog(): Observable<RewardItem[]> {
        return this.http.get<RewardItem[]>('/api/v1/rewards');
    }

    getCart(customerId: number): Observable<RewardCart> {
        return this.http.get<RewardCart>(`/api/v1/customers/${customerId}/cart`);
    }

    addToCart(customerId: number, itemId: number): Observable<void> {
        return this.http.post<void>(`/api/v1/customers/${customerId}/cart/items/${itemId}`, {});
    }

    removeFromCart(customerId: number, itemId: number): Observable<void> {
        return this.http.delete<void>(`/api/v1/customers/${customerId}/cart/items/${itemId}`);
    }

    redeemCart(customerId: number): Observable<void> {
        return this.http.post<void>(`/api/v1/customers/${customerId}/rewards/redeem`, {});
    }

    getHistory(customerId: number, page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`/api/v1/customers/${customerId}/redemptions`, {
            params: { page, size }
        });
    }

    getBalance(customerId: number): Observable<{ availablePoints: number }> {
        return this.http.get<{ availablePoints: number }>(`/api/v1/customers/${customerId}/rewards/balance`);
    }
}
