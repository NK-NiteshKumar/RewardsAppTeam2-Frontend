import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RewardService, RewardCart } from '../../../core/services/reward.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
    selector: 'app-reward-cart',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-white">Shopping Cart</h2>
                <p class="text-slate-400 text-sm">Review your items before redemption</p>
            </div>
            <button (click)="backToProfile()" class="text-slate-400 hover:text-white transition-colors">
                <i class="ph ph-arrow-left mr-2"></i> Back to Profile
            </button>
        </div>

        <!-- Balance Card -->
        <div class="glass-card p-4 border-l-4 border-brand-primary">
            <div class="flex items-center justify-between">
                <div class="text-sm text-slate-400">Available Balance:</div>
                <div class="text-2xl font-bold text-white">{{ availableBalance | number }} pts</div>
            </div>
        </div>

        <!-- Cart Items -->
        <div class="space-y-3">
            <div *ngFor="let cartItem of cart?.items || []" class="glass-card p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 rounded-lg flex items-center justify-center">
                        <i class="ph ph-gift text-2xl text-brand-primary"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">{{ cartItem.name }}</h3>
                        <p class="text-sm text-slate-400">Qty: {{ cartItem.quantity }} x {{ cartItem.pointsCost | number }} pts</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <div class="text-brand-primary font-bold text-lg">{{ cartItem.totalPoints | number }} pts</div>
                    </div>
                    <button (click)="removeItem(cartItem.rewardItemId)" 
                            [disabled]="removing === cartItem.rewardItemId"
                            class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50">
                        <i class="ph ph-trash text-xl"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!cart || cart.items?.length === 0" class="glass-card p-10 text-center text-slate-500">
            <i class="ph ph-shopping-cart text-6xl mb-4 block opacity-20"></i>
            <p class="text-lg mb-4">Your cart is empty</p>
            <button (click)="backToCatalog()" class="btn-primary">
                Browse Rewards
            </button>
        </div>

        <!-- Redemption Summary -->
        <div *ngIf="cart && cart.items && cart.items.length > 0" class="glass-card p-6 space-y-4 border-2 border-brand-primary/30">
            <div class="text-lg text-white font-bold mb-4">Redemption Summary</div>
            
            <div class="flex justify-between text-lg border-b border-white/5 pb-3">
                <span class="text-slate-400">Total Items:</span>
                <span class="text-white font-medium">{{ cart.items.length }}</span>
            </div>
            
            <div class="flex justify-between text-xl py-3">
                <span class="text-slate-400">Total Points Required:</span>
                <span class="text-brand-primary font-bold">{{ cart.totalPoints | number }}</span>
            </div>

            <div class="flex justify-between text-lg border-t border-white/5 pt-3">
                <span class="text-slate-400">Remaining Balance:</span>
                <span [class.text-red-400]="availableBalance - cart.totalPoints < 0" 
                      [class.text-green-400]="availableBalance - cart.totalPoints >= 0" 
                      class="font-bold">
                    {{ (availableBalance - cart.totalPoints) | number }}
                </span>
            </div>

            <div *ngIf="insufficientBalance" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm flex items-center gap-3">
                <i class="ph ph-warning-circle text-xl"></i>
                <span>Insufficient balance. You need {{ (cart.totalPoints - availableBalance) | number }} more points.</span>
            </div>

            <button 
                (click)="redeemCart()" 
                [disabled]="redeeming || insufficientBalance" 
                class="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/20">
                <span *ngIf="!redeeming && !insufficientBalance">
                    <i class="ph ph-check-circle mr-2"></i> Redeem All Items
                </span>
                <span *ngIf="redeeming">Processing Redemption...</span>
                <span *ngIf="!redeeming && insufficientBalance">Insufficient Points</span>
            </button>
        </div>
    </div>
    `,
    styles: [`
        .btn-primary {
            @apply bg-brand-primary hover:bg-brand-accent text-white px-6 py-2 rounded-lg font-medium transition-all;
        }
        .glass-card {
            @apply bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl;
        }
    `]
})
export class RewardCartComponent implements OnInit {
    customerId!: number;
    cart: RewardCart | null = null;
    availableBalance: number = 0;
    removing: number | null = null;
    redeeming: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private rewardService: RewardService,
        private customerService: CustomerService
    ) { }

    get insufficientBalance(): boolean {
        return this.cart ? this.availableBalance < this.cart.totalPoints : false;
    }

    ngOnInit() {
        this.customerId = +this.route.snapshot.paramMap.get('id')!;
        this.loadCart();
        this.loadBalance();
    }

    loadCart() {
        this.rewardService.getCart(this.customerId).subscribe({
            next: (cart) => {
                this.cart = cart;
            },
            error: () => {
                this.cart = null;
            }
        });
    }

    loadBalance() {
        this.rewardService.getBalance(this.customerId).subscribe({
            next: (res) => {
                this.availableBalance = res.availablePoints;
            }
        });
    }

    removeItem(itemId: number) {
        if (!confirm('Remove this item from cart?')) return;

        this.removing = itemId;
        this.rewardService.removeFromCart(this.customerId, itemId).subscribe({
            next: () => {
                this.removing = null;
                this.loadCart();
            },
            error: (err) => {
                this.removing = null;
                alert(err.error?.message || 'Failed to remove item');
            }
        });
    }

    redeemCart() {
        if (this.insufficientBalance) {
            alert('Insufficient balance to redeem these items.');
            return;
        }

        if (!confirm(`Redeem all items for ${this.cart?.totalPoints} points? This action cannot be undone.`)) return;

        this.redeeming = true;
        this.rewardService.redeemCart(this.customerId).subscribe({
            next: () => {
                this.redeeming = false;
                alert('Redemption successful! Your rewards are on the way.');
                this.router.navigate(['/customers', this.customerId]);
            },
            error: (err) => {
                this.redeeming = false;
                alert(err.error?.message || 'Redemption failed. Please try again later.');
            }
        });
    }

    backToProfile() {
        this.router.navigate(['/customers', this.customerId]);
    }

    backToCatalog() {
        this.router.navigate(['/customers', this.customerId, 'rewards']);
    }
}
