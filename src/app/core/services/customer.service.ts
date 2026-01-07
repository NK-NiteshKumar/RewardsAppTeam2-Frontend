import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    status: string;
    customerType: string;
}

export interface CustomerListResponse {
    content: Customer[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface CustomerProfile {
    customer: Customer;
    rewardBalance: number;
}

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private apiUrl = '/api/v1/customers';

    constructor(private http: HttpClient) { }

    getCustomers(page: number = 0, size: number = 10, search?: string, status: string = 'ACTIVE'): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('status', status);

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    createCustomer(customer: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, customer);
    }

    updateCustomer(customerId: number, customer: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${customerId}`, customer);
    }

    deleteCustomer(customerId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${customerId}`);
    }

    activateCustomer(customerId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${customerId}/activate`, {});
    }

    // Profile
    getCustomerProfile(customerId: number): Observable<CustomerProfile> {
        return this.http.get<CustomerProfile>(`${this.apiUrl}/${customerId}/profile`); // Adjust URL based on backend controller path
    }

    // Card management methods
    relinkCard(customerId: number, cardId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${customerId}/cards/${cardId}/relink`, {});
    }

    processRewards(customerId: number, cardId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${customerId}/cards/${cardId}/transactions/process-rewards`, {});
    }
}
