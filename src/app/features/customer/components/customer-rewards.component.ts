import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RewardService, RewardItem } from '../../../core/services/reward.service';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-rewards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-white">Reward Catalog</h2>
          <p class="text-slate-400 text-sm">Browse and redeem rewards using your points</p>
        </div>
        <button [routerLink]="['/customers', customerId, 'cart']" class="btn-primary flex items-center gap-2">
          <i class="ph ph-shopping-cart"></i>
          View Cart <span *ngIf="cartItemCount > 0" class="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{{ cartItemCount }}</span>
        </button>
      </div>

      <!-- Balance Card -->
      <div class="glass-card p-6 border-l-4 border-brand-primary">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-slate-400 uppercase tracking-wide">Available Points</div>
            <div class="text-4xl font-bold text-white mt-1">{{ availableBalance | number }}</div>
          </div>
          <i class="ph ph-coins text-6xl text-brand-primary opacity-20"></i>
        </div>
      </div>

      <!-- Reward Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let item of rewardItems" class="glass-card overflow-hidden group hover:border-brand-primary/50 transition-all">
          <div class="aspect-square bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 flex items-center justify-center">
            <i class="ph ph-gift text-6xl text-brand-primary"></i>
          </div>
          <div class="p-4">
            <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">{{ item.category }}</div>
            <h3 class="text-lg font-bold text-white mb-2">{{ item.name }}</h3>
            <div class="flex items-center justify-between mb-3">
              <div class="text-brand-primary font-bold text-xl">{{ item.pointsCost | number }} pts</div>
            </div>
            <button 
              (click)="addItemToCart(item.id)" 
              [disabled]="adding === item.id || availableBalance < item.pointsCost"
              class="w-full btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="adding === item.id">Adding...</span>
              <span *ngIf="adding !== item.id && availableBalance >= item.pointsCost">
                <i class="ph ph-plus mr-1"></i> Add to Cart
              </span>
              <span *ngIf="adding !== item.id && availableBalance < item.pointsCost">
                Insufficient Points
              </span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="rewardItems.length === 0" class="glass-card p-10 text-center text-slate-500">
        <i class="ph ph-gift text-6xl mb-4 block"></i>
        No reward items available at this time.
      </div>
    </div>
  `
})
export class CustomerRewardsComponent implements OnInit {
  customerId!: number;
  rewardItems: RewardItem[] = [];
  availableBalance: number = 0;
  cartItemCount: number = 0;
  adding: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private rewardService: RewardService,
    private customerService: CustomerService
  ) { }

  ngOnInit() {
    this.customerId = +this.route.snapshot.paramMap.get('id')!;
    this.loadCatalog();
    this.loadBalance();
    this.loadCartCount();
  }

  loadCatalog() {
    this.rewardService.getRewardCatalog().subscribe(items => {
      this.rewardItems = items;
    });
  }

  loadBalance() {
    this.rewardService.getBalance(this.customerId).subscribe(res => {
      this.availableBalance = res.availablePoints;
    });
  }

  loadCartCount() {
    this.rewardService.getCart(this.customerId).subscribe({
      next: (cart) => {
        this.cartItemCount = cart.items?.length || 0;
      },
      error: () => {
        this.cartItemCount = 0;
      }
    });
  }

  addItemToCart(itemId: number) {
    this.adding = itemId;
    this.rewardService.addToCart(this.customerId, itemId).subscribe({
      next: () => {
        this.adding = null;
        this.loadCartCount();
        // Optional: show success message
      },
      error: (err) => {
        this.adding = null;
        alert(err.error?.message || 'Failed to add item to cart');
      }
    });
  }
}
