import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerService, Customer, CustomerListResponse } from '../../../core/services/customer.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white">Customers</h2>
          <p class="text-slate-400 text-sm">Manage banking customers and their accounts</p>
        </div>
        <button routerLink="/customers/new" class="btn-primary flex items-center gap-2">
          <i class="ph ph-plus-circle text-lg"></i>
          Register Customer
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-96">
          <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            [ngModel]="searchQuery" 
            (ngModelChange)="onSearch($event)"
            placeholder="Search by name or email..." 
            class="input-primary pl-10 py-2 text-sm"
          >
        </div>
        
        <div class="flex items-center gap-2 w-full md:w-auto">
           <select [(ngModel)]="statusFilter" (change)="loadCustomers()" class="bg-slate-900/50 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5">
             <option value="ACTIVE">Active Users</option>
             <option value="INACTIVE">Inactive Users</option>
           </select>
        </div>
      </div>

      <!-- Table -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left text-slate-400">
            <thead class="text-xs text-slate-300 uppercase bg-white/5">
              <tr>
                <th scope="col" class="px-6 py-4">Customer</th>
                <th scope="col" class="px-6 py-4">Status</th>
                <th scope="col" class="px-6 py-4">Type</th>
                <th scope="col" class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of customers" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold cursor-pointer hover:bg-brand-primary/30 transition-colors" 
                           [routerLink]="['/customers', customer.id]">
                         {{ customer.firstName.charAt(0) }}{{ customer.lastName.charAt(0) }}
                      </div>
                      <div>
                        <div class="text-white font-medium">{{ customer.firstName }} {{ customer.lastName }}</div>
                        <div class="text-xs">{{ customer.email }}</div>
                      </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                  <span [ngClass]="{
                    'bg-green-500/10 text-green-400 border-green-500/20': customer.status === 'ACTIVE',
                    'bg-red-500/10 text-red-400 border-red-500/20': customer.status !== 'ACTIVE'
                  }" class="px-2.5 py-0.5 rounded-full text-xs font-medium border">
                    {{ customer.status }}
                  </span>
                </td>
                 <td class="px-6 py-4">
                  <span [ngClass]="{
                    'text-brand-warning': customer.customerType === 'PREMIUM',
                    'text-slate-400': customer.customerType !== 'PREMIUM'
                  }" class="flex items-center gap-1">
                    <i *ngIf="customer.customerType === 'PREMIUM'" class="ph ph-crown-simple text-lg"></i>
                    {{ customer.customerType }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                       <!-- View Profile -->
                       <button 
                           [routerLink]="['/customers', customer.id]"
                           class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                           title="View Profile">
                           <i class="ph ph-eye text-base"></i>
                           <span>Profile</span>
                       </button>

                      <!-- Status Actions -->
                      <button 
                          *ngIf="customer.status === 'ACTIVE'"
                          (click)="deactivateCustomer(customer.id, $event)"
                          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all"
                          title="Deactivate Customer">
                          <i class="ph ph-power text-base"></i>
                          <span>Deactivate</span>
                      </button>
                      <button 
                          *ngIf="customer.status === 'INACTIVE'"
                          (click)="activateCustomer(customer.id, $event)"
                          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 rounded-lg transition-all"
                          title="Activate Customer">
                          <i class="ph ph-lightning text-base"></i>
                          <span>Activate</span>
                      </button>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="customers.length === 0 && !loading">
                  <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                      No customers found matching your criteria.
                  </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between p-4 border-t border-white/5" *ngIf="totalPages > 1">
           <button 
             class="px-3 py-1 text-sm rounded-md bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
             [disabled]="currentPage === 0"
             (click)="changePage(currentPage - 1)">
             Previous
           </button>
           <span class="text-sm text-slate-400">
             Page {{ currentPage + 1 }} of {{ totalPages }}
           </span>
           <button 
             class="px-3 py-1 text-sm rounded-md bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
             [disabled]="currentPage === totalPages - 1"
             (click)="changePage(currentPage + 1)">
             Next
           </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  // Filters
  searchQuery = '';
  statusFilter = 'ACTIVE';

  private searchSubject = new Subject<string>();

  constructor(private customerService: CustomerService) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 0;
      this.loadCustomers();
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  loadCustomers() {
    this.loading = true;
    this.customerService.getCustomers(this.currentPage, this.pageSize, this.searchQuery, this.statusFilter)
      .subscribe({
        next: (res) => {
          this.customers = res.content;
          this.totalPages = res.totalPages;
          this.loading = false;
          // IMPORTANT: If API returns empty content but totalPages > 0, handle it? 
          // Usually spring boot PageImpl handles it well.
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadCustomers();
  }

  activateCustomer(customerId: number, event: Event) {
    event.stopPropagation(); // Prevent navigation
    if (!confirm('Activate this customer?')) return;

    this.customerService.activateCustomer(customerId).subscribe({
      next: () => {
        this.loadCustomers(); // Refresh list
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to activate customer');
      }
    });
  }

  deactivateCustomer(customerId: number, event: Event) {
    event.stopPropagation(); // Prevent navigation
    if (!confirm('Deactivate this customer? This will soft-delete their account.')) return;

    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => {
        this.loadCustomers(); // Refresh list
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to deactivate customer');
      }
    });
  }
}
