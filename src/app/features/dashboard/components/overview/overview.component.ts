import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../../core/services/transaction.service';
import { Transaction } from '../../../../core/models/api.models';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
    transactions: Transaction[] = [];
    isLoading = true;

    // Demo IDs - in a real app these come from User Profile / Context
    customerId = 1;
    cardId = 1;

    constructor(private transactionService: TransactionService) { }

    ngOnInit(): void {
        this.loadTransactions();
    }

    loadTransactions(): void {
        this.transactionService.getTransactions(this.customerId, this.cardId).subscribe({
            next: (response) => {
                this.transactions = response.content;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load transactions', err);
                // Fallback for demo if backend is empty/erroring to show UI
                this.transactions = [];
                this.isLoading = false;
            }
        });
    }
}
