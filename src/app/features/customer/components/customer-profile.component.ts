import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { CreditCardService, CreditCard } from '../../../core/services/credit-card.service';
import { TransactionService, Transaction } from '../../../core/services/transaction.service';
import { RewardService } from '../../../core/services/reward.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-customer-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="space-y-6" *ngIf="profile">
      <!-- Header / Profile Card -->
      <div class="glass-card p-6 relative overflow-hidden">
        <div class="absolute right-0 top-0 p-8 opacity-5">
            <i class="ph ph-user text-9xl text-white"></i>
        </div>
        
        <div class="relative z-10 flex flex-col md:flex-row gap-6 items-start">
            <div class="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-300 border-2 border-white/10 shadow-xl">
                {{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}
            </div>
            
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                    <h2 class="text-3xl font-bold text-white">{{ profile.firstName }} {{ profile.lastName }}</h2>
                    <span *ngIf="profile.customerType === 'PREMIUM'" class="px-3 py-1 bg-brand-warning/20 text-brand-warning border border-brand-warning/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <i class="ph ph-crown-simple"></i> Premium
                    </span>
                    <span *ngIf="profile.customerType !== 'PREMIUM'" class="px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        Regular
                    </span>
                    <span [class.bg-green-500]="profile.status === 'ACTIVE'" [class.bg-red-500]="profile.status !== 'ACTIVE'" class="w-2 h-2 rounded-full"></span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-slate-400 mt-4">
                    <div class="flex items-center gap-2">
                        <i class="ph ph-envelope"></i> {{ profile.email }}
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="ph ph-phone"></i> {{ profile.phoneNo }}
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="ph ph-calendar"></i> DOB: {{ profile.dob | date }}
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="ph ph-calendar-check"></i> Joined: {{ profile.doj | date }}
                    </div>
                </div>
            </div>

            <!-- Action Buttons (Edit / Activate / Deactivate) -->
            <div class="flex flex-col gap-2">
                <button (click)="openEditModal()" class="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                    <i class="ph ph-pencil"></i> Edit Profile
                </button>
                <button *ngIf="profile.status === 'ACTIVE'" 
                        (click)="deactivateCustomer()" 
                        class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm flex items-center gap-2">
                    <i class="ph ph-x-circle"></i> Deactivate
                </button>
                <button *ngIf="profile.status === 'INACTIVE'" 
                        (click)="activateCustomer()" 
                        class="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm flex items-center gap-2">
                    <i class="ph ph-check-circle"></i> Activate
                </button>
            </div>

            <!-- Reward Balance -->
            <div class="bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 border border-white/10 rounded-xl p-4 text-center min-w-[200px]">
                <div class="text-xs text-brand-primary font-bold uppercase tracking-widest mb-1">Reward Points</div>
                <div class="text-3xl font-bold text-white mb-2">{{ rewardBalance | number }}</div>
                <button [routerLink]="['/customers', customerId, 'rewards']" class="text-xs text-white bg-brand-primary hover:bg-brand-accent px-3 py-1.5 rounded-lg w-full transition-colors">
                    Redeem Now
                </button>
            </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center border-b border-white/10 space-x-6 px-2">
          <button (click)="activeTab = 'cards'" [class.text-brand-primary]="activeTab === 'cards'" [class.border-brand-primary]="activeTab === 'cards'"
             class="pb-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all">
             <i class="ph ph-credit-card mr-1"></i> Credit Cards
          </button>
          <button (click)="activeTab = 'transactions'" [class.text-brand-primary]="activeTab === 'transactions'" [class.border-brand-primary]="activeTab === 'transactions'"
             class="pb-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all">
             <i class="ph ph-receipt mr-1"></i> Transactions
          </button>
          <button (click)="activeTab = 'redemptions'; loadRedemptionHistory()" [class.text-brand-primary]="activeTab === 'redemptions'" [class.border-brand-primary]="activeTab === 'redemptions'"
             class="pb-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-all">
             <i class="ph ph-gift mr-1"></i> Redemptions
          </button>
      </div>

      <!-- Tab Content: Cards -->
      <div *ngIf="activeTab === 'cards'" class="space-y-4">
         <!-- Header with Show Unlinked Toggle -->
         <div class="flex justify-between items-center flex-wrap gap-4">
             <div class="flex items-center gap-4">
                 <h3 class="text-lg font-semibold text-white">Credit Cards</h3>
                 <label class="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                     <input type="checkbox" [(ngModel)]="showUnlinked" (change)="loadCards()" class="rounded bg-slate-700 border-slate-600">
                     <span>Show Unlinked</span>
                 </label>
             </div>
             <button (click)="openLinkCardModal()" class="btn-primary text-sm px-4 py-2">Link New Card</button>
         </div>

         <!-- Cards Grid -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div *ngFor="let card of cards" class="glass-card p-6 relative group border-l-4" 
                  [ngClass]="{'border-brand-primary': card.status === 'LINKED', 'border-slate-600': card.status === 'UNLINKED'}">
                 <div class="flex justify-between items-start mb-4">
                     <i class="ph ph-credit-card text-2xl text-slate-300"></i>
                     <span [class]="card.status === 'LINKED' ? 'text-green-400' : 'text-red-400'" class="text-xs font-bold uppercase">
                         {{ card.status === 'LINKED' ? 'Linked' : 'Unlinked' }}
                     </span>
                 </div>
                 <div class="text-xl font-mono text-white tracking-wider mb-2">
                     {{ card.maskedCardNumber || card.cardNumber }}
                 </div>
                 <div class="flex justify-between text-xs text-slate-400">
                     <span>{{ card.cardType }}</span>
                     <span>Exp: {{ card.expiryDate }}</span>
                 </div>
                 
                 <!-- Action Buttons for LINKED Cards -->
                 <div *ngIf="card.status === 'LINKED'" class="mt-4 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button (click)="generateTransactions(card.id)" 
                             class="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded" 
                             title="Generate 100 Transactions">
                        Gen. Txns
                     </button>
                     <button (click)="viewTransactions(card.id)" 
                             class="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs py-2 rounded">
                        View Txns
                     </button>
                     <button (click)="processRewards(card.id)" 
                             class="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs py-2 rounded"
                             title="Process Rewards for this Card">
                        Process
                     </button>
                     <button (click)="unlinkCard(card.id)" 
                             class="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded">
                        <i class="ph ph-link-break"></i>
                     </button>
                 </div>

                 <!-- Action Buttons for UNLINKED Cards -->
                 <div *ngIf="card.status === 'UNLINKED'" class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button (click)="relinkCard(card.id)" 
                             class="w-full bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary text-xs py-2 rounded">
                        <i class="ph ph-link mr-1"></i> Relink Card
                     </button>
                 </div>
             </div>
             
             <div *ngIf="cards.length === 0" class="col-span-3 text-center py-10 text-slate-500">
                 {{ showUnlinked ? 'No cards found.' : 'No linked cards. Toggle "Show Unlinked" to see all cards.' }}
             </div>
         </div>
      </div>



      <!-- Tab Content: Transactions -->
      <div *ngIf="activeTab === 'transactions'" class="space-y-4">
          <div class="flex gap-4 mb-4">
              <select [(ngModel)]="selectedCardId" (change)="loadTransactions()" class="input-primary w-64">
                  <option [ngValue]="null">Select a Card</option>
                  <option *ngFor="let card of cards" [value]="card.id">{{ card.maskedCardNumber || card.cardNumber }} ({{card.cardType}})</option>
              </select>
          </div>

          <div class="glass-card overflow-hidden" *ngIf="selectedCardId">
               <table class="w-full text-sm text-left text-slate-400">
                   <thead class="bg-white/5 text-xs uppercase text-slate-300">
                       <tr>
                           <th class="px-6 py-3">Txn ID</th>
                           <th class="px-6 py-3">Date</th>
                           <th class="px-6 py-3">Amount</th>
                           <th class="px-6 py-3">Reward Points</th>
                           <th class="px-6 py-3">Status</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr *ngFor="let txn of transactions" class="border-b border-white/5 hover:bg-white/5">
                           <td class="px-6 py-4 text-slate-300">{{ txn.transactionId }}</td>
                           <td class="px-6 py-4">{{ txn.transactionDate | date:'short' }}</td>
                           <td class="px-6 py-4 text-white font-semibold">₹{{ txn.amount | number }}</td>
                           <td class="px-6 py-4 text-brand-primary font-semibold">{{ txn.rewardPoints }}</td>
                           <td class="px-6 py-4">
                               <span [ngClass]="{
                                   'bg-green-500/10 text-green-400': txn.status === 'PROCESSED',
                                   'bg-yellow-500/10 text-yellow-400': txn.status === 'PENDING'
                               }" class="px-2 py-1 rounded text-xs">
                                   {{ txn.status }}
                               </span>
                           </td>
                       </tr>
                   </tbody>
               </table>
               
               <!-- Pagination -->
               <div class="flex items-center justify-between p-4 border-t border-white/5" *ngIf="totalTransactionPages > 1">
                   <button 
                       class="px-3 py-1 text-sm rounded-md bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                       [disabled]="transactionPage === 0"
                       (click)="changeTransactionPage(transactionPage - 1)">
                       Previous
                   </button>
                   <span class="text-sm text-slate-400">
                       Page {{ transactionPage + 1 }} of {{ totalTransactionPages }}
                   </span>
                   <button 
                       class="px-3 py-1 text-sm rounded-md bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                       [disabled]="transactionPage === totalTransactionPages - 1"
                       (click)="changeTransactionPage(transactionPage + 1)">
                       Next
                   </button>
               </div>
          </div>
          
          <div *ngIf="!selectedCardId" class="text-center py-10 text-slate-500 glass-card">
              Please select a card to view transactions.
          </div>
      </div>
      
       <!-- Tab Content: Redemptions -->
       <div *ngIf="activeTab === 'redemptions'" class="space-y-4">
           <div class="glass-card overflow-hidden" *ngIf="redemptionHistory.length > 0">
                <table class="w-full text-sm text-left text-slate-400">
                    <thead class="bg-white/5 text-xs uppercase text-slate-300">
                        <tr>
                            <th class="px-6 py-3">Redemption ID</th>
                            <th class="px-6 py-3">Items</th>
                            <th class="px-6 py-3 text-right">Total Points</th>
                            <th class="px-6 py-3">Date</th>
                            <th class="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let red of redemptionHistory" class="border-b border-white/5 hover:bg-white/5 align-top">
                            <td class="px-6 py-4 text-slate-300 font-mono text-xs">{{ red.redemptionId }}</td>
                            <td class="px-6 py-4">
                                <div class="space-y-2">
                                    <div *ngFor="let item of red.items" class="flex flex-col">
                                        <span class="text-white font-medium">{{ item.rewardItemName }}</span>
                                        <span class="text-xs text-slate-500">Qty: {{ item.quantity }} x {{ item.pointsCost | number }} pts</span>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-brand-primary font-bold text-lg text-right">{{ red.pointsUsed | number }}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{{ red.redeemedDate | date:'short' }}</td>
                            <td class="px-6 py-4">
                                <span class="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium border border-green-500/20">
                                    COMPLETED
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <!-- Pagination -->
                <div class="flex items-center justify-between p-4 border-t border-white/5" *ngIf="totalRedemptionPages > 1">
                    <button 
                        class="px-3 py-1 text-sm rounded-md bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                        [disabled]="redemptionPage === 0"
                        (click)="changeRedemptionPage(redemptionPage - 1)">
                        Previous
                    </button>
                    <span class="text-sm text-slate-400">
                        Page {{ redemptionPage + 1 }} of {{ totalRedemptionPages }}
                    </span>
                    <button 
                        class="px-3 py-1 text-sm rounded-md bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-50"
                        [disabled]="redemptionPage === totalRedemptionPages - 1"
                        (click)="changeRedemptionPage(redemptionPage + 1)">
                        Next
                    </button>
                </div>
           </div>
           
           <div *ngIf="redemptionHistory.length === 0" class="text-center py-12 text-slate-500 glass-card">
               <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                   <i class="ph ph-gift text-3xl opacity-20"></i>
               </div>
               <p class="text-lg text-slate-400">No redemptions found</p>
               <p class="text-sm">Redeem some rewards to see them listed here.</p>
           </div>
       </div>

       <!-- Edit Profile Modal -->
       <div *ngIf="showEditModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div class="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
               <h3 class="text-xl font-bold text-white">Edit Customer Profile</h3>
               
               <div class="space-y-4">
                   <div class="grid grid-cols-2 gap-4">
                       <div class="space-y-2">
                           <label class="text-sm text-slate-400">First Name</label>
                           <input type="text" [(ngModel)]="editForm.firstName" class="input-primary">
                       </div>
                       <div class="space-y-2">
                           <label class="text-sm text-slate-400">Last Name</label>
                           <input type="text" [(ngModel)]="editForm.lastName" class="input-primary">
                       </div>
                   </div>
                   
                   <div class="space-y-2">
                       <label class="text-sm text-slate-400">Email</label>
                       <input type="email" [(ngModel)]="editForm.email" class="input-primary">
                   </div>
                   
                   <div class="space-y-2">
                       <label class="text-sm text-slate-400">Phone Number</label>
                       <input type="text" [(ngModel)]="editForm.phoneNo" class="input-primary">
                   </div>

                   <!-- Read-only fields -->
                   <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
                       <div class="text-xs text-slate-500 uppercase font-bold">Read-Only</div>
                       <div class="grid grid-cols-2 gap-4 text-sm">
                           <div>
                               <span class="text-slate-400">DOB:</span>
                               <span class="text-white ml-2">{{ profile.dob | date }}</span>
                           </div>
                           <div>
                               <span class="text-slate-400">Joined:</span>
                               <span class="text-white ml-2">{{ profile.doj | date }}</span>
                           </div>
                       </div>
                   </div>
               </div>
               
               <div class="flex justify-end gap-3 mt-4">
                   <button (click)="closeEditModal()" class="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-white/5">Cancel</button>
                   <button (click)="saveProfile()" [disabled]="savingProfile" class="btn-primary">
                       {{ savingProfile ? 'Saving...' : 'Save Changes' }}
                   </button>
               </div>
           </div>
       </div>

       <!-- Link Card Modal -->
       <div *ngIf="showLinkCardModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div class="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
               <h3 class="text-xl font-bold text-white">Link New Card</h3>
               <div class="space-y-2">
                   <label class="text-sm text-slate-400">Card Number 
                       <span class="text-xs text-slate-500">(16 digits)</span>
                   </label>
                   <input type="text" [(ngModel)]="newCardNumber" placeholder="XXXX XXXX XXXX XXXX" class="input-primary font-mono tracking-widest">
               </div>
               
               <div class="grid grid-cols-2 gap-4">
                   <div class="space-y-2">
                       <label class="text-sm text-slate-400">Expiry Date</label>
                       <input type="date" [(ngModel)]="newCardExpiry" class="input-primary text-slate-400">
                   </div>
                   <div class="space-y-2">
                       <label class="text-sm text-slate-400">CVV</label>
                       <input type="text" [(ngModel)]="newCardCvv" placeholder="123" maxlength="3" class="input-primary font-mono text-center">
                   </div>
               </div>
               
               <div class="flex justify-end gap-3 mt-4">
                   <button (click)="showLinkCardModal = false" class="px-4 py-2 rounded text-slate-400 hover:text-white hover:bg-white/5">Cancel</button>
                   <button (click)="linkCard()" [disabled]="!newCardNumber || !newCardExpiry || !newCardCvv || linking" class="btn-primary">
                       {{ linking ? 'Linking...' : 'Link Card' }}
                   </button>
               </div>
           </div>
       </div>

    </div>
  `
})
export class CustomerProfileComponent implements OnInit {
    activeTab = 'cards';
    profile: any;
    cards: CreditCard[] = [];
    transactions: Transaction[] = [];
    rewardBalance: number = 0;
    selectedCardId: number | null = null;
    customerId!: number;
    showUnlinked = false; // Show/hide unlinked cards

    // Transaction pagination
    transactionPage = 0;
    transactionPageSize = 20;
    totalTransactionPages = 0;

    // Redemption history
    redemptionHistory: any[] = [];
    redemptionPage = 0;
    redemptionPageSize = 10;
    totalRedemptionPages = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private customerService: CustomerService,
        private cardService: CreditCardService,
        private txnService: TransactionService,
        private rewardService: RewardService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.customerId = +params['id'];
            this.loadProfile();
            this.loadCards();
        });
    }

    loadProfile() {
        this.customerService.getCustomerProfile(this.customerId).subscribe(res => {
            this.profile = res.customer; // Adjust based on response structure
            this.rewardBalance = res.rewardBalance || 0;
        });
    }

    loadCards() {
        this.cardService.getCards(this.customerId, this.showUnlinked).subscribe(res => {
            this.cards = res;
        });
    }

    loadTransactions() {
        if (!this.selectedCardId) return;
        this.txnService.getTransactions(this.customerId, this.selectedCardId, this.transactionPage, this.transactionPageSize).subscribe(res => {
            this.transactions = res.content;
            this.totalTransactionPages = res.totalPages;
        });
    }

    changeTransactionPage(page: number) {
        this.transactionPage = page;
        this.loadTransactions();
    }

    loadRedemptionHistory() {
        this.rewardService.getHistory(this.customerId, this.redemptionPage, this.redemptionPageSize).subscribe(res => {
            this.redemptionHistory = res.content;
            this.totalRedemptionPages = res.totalPages;
        });
    }

    changeRedemptionPage(page: number) {
        this.redemptionPage = page;
        this.loadRedemptionHistory();
    }

    // Edit Profile Modal
    showEditModal = false;
    editForm = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNo: ''
    };
    savingProfile = false;

    openEditModal() {
        this.editForm = {
            firstName: this.profile.firstName,
            lastName: this.profile.lastName,
            email: this.profile.email,
            phoneNo: this.profile.phoneNo
        };
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
    }

    saveProfile() {
        this.savingProfile = true;
        this.customerService.updateCustomer(this.customerId, this.editForm).subscribe({
            next: () => {
                this.savingProfile = false;
                this.showEditModal = false;
                this.loadProfile(); // Refresh profile
                alert('Profile updated successfully!');
            },
            error: (err) => {
                this.savingProfile = false;
                alert(err.error?.message || 'Failed to update profile');
            }
        });
    }

    activateCustomer() {
        if (!confirm('Activate this customer?')) return;
        this.customerService.activateCustomer(this.customerId).subscribe(() => {
            alert('Customer activated');
            this.loadProfile();
        });
    }

    deactivateCustomer() {
        if (!confirm('Deactivate this customer? This will soft-delete their account.')) return;
        this.customerService.deleteCustomer(this.customerId).subscribe(() => {
            alert('Customer deactivated');
            this.loadProfile();
        });
    }

    generateTransactions(cardId: number) {
        if (confirm('Generate 100 random transactions for this card?')) {
            this.txnService.generateTransactions(this.customerId, cardId).subscribe(() => {
                alert('Transactions generated!');
                if (this.selectedCardId === cardId) this.loadTransactions();
            });
        }
    }

    unlinkCard(cardId: number): void {
        if (!confirm('Unlink this card? You can relink it later.')) return;
        this.cardService.unlinkCard(this.customerId, cardId).subscribe(() => {
            alert('Card unlinked');
            this.loadCards();
        });
    }

    relinkCard(cardId: number): void {
        this.customerService.relinkCard(this.customerId, cardId).subscribe({
            next: () => {
                alert('Card relinked successfully!');
                this.loadCards();
            },
            error: (err) => {
                alert(err.error?.message || 'Relink failed');
            }
        });
    }

    processRewards(cardId: number): void {
        if (!confirm('Process rewards for this card?')) return;
        this.customerService.processRewards(this.customerId, cardId).subscribe(() => {
            alert('Rewards processed');
            this.loadProfile(); // Refresh to get updated reward balance
        });
    }

    viewTransactions(cardId: number): void {
        this.activeTab = 'transactions';
        this.selectedCardId = cardId;
        this.loadTransactions();
    }

    showLinkCardModal = false;
    newCardNumber = '';
    newCardExpiry = '';
    newCardCvv = '';
    linking = false;

    openLinkCardModal() {
        this.showLinkCardModal = true;
        this.newCardNumber = '';
        this.newCardExpiry = '';
        this.newCardCvv = '';
    }

    linkCard() {
        if (!this.newCardNumber || this.newCardNumber.length < 16) {
            alert('Please enter a valid 16-digit card number');
            return;
        }
        if (!this.newCardExpiry) {
            alert('Please select an expiry date');
            return;
        }
        if (!this.newCardCvv || this.newCardCvv.length !== 3) {
            alert('Please enter a valid 3-digit CVV');
            return;
        }

        this.linking = true;
        // Clean card number just in case
        const cleanNumber = this.newCardNumber.replace(/\s/g, '');

        const cardData = {
            cardNumber: cleanNumber,
            expiryDate: this.newCardExpiry,
            cvv: this.newCardCvv
        };

        this.cardService.linkCard(this.customerId, cardData).subscribe({
            next: () => {
                this.linking = false;
                this.showLinkCardModal = false;
                this.loadCards(); // Refresh list
                alert('Card linked successfully!');
            },
            error: (err) => {
                this.linking = false;
                alert('Failed to link card: ' + (err.error?.message || 'Unknown error'));
            }
        });
    }
}
