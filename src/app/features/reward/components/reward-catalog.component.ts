import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RewardService, RewardItem } from '../../../core/services/reward.service';

@Component({
    selector: 'app-reward-catalog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-6">
      <!-- Hero Section -->
      <div class="glass-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-r from-brand-primary to-brand-accent">
        <div class="relative z-10 max-w-2xl">
           <h2 class="text-4xl font-bold text-white mb-4">Explore Our Reward Catalog</h2>
           <p class="text-white/80 text-lg mb-8">
             Discover a world of exclusive rewards. From luxury travel to the latest electronics, find the perfect way to spend your points.
           </p>
           <div class="flex gap-4">
              <button (click)="selectedCategory = 'All'" class="bg-white text-brand-primary font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Browse All
              </button>
           </div>
        </div>
        <!-- Decorative Circle -->
        <div class="absolute -right-20 -bottom-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -right-40 -top-20 w-80 h-80 bg-brand-warning/20 rounded-full blur-3xl"></div>
      </div>

      <!-- Categories -->
      <div class="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          <button 
            *ngFor="let cat of categories" 
            (click)="selectedCategory = cat.value"
            [class.bg-brand-primary]="selectedCategory === cat.value"
            [class.text-white]="selectedCategory === cat.value"
            [class.border-brand-primary]="selectedCategory === cat.value"
            class="px-6 py-2 rounded-full border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white whitespace-nowrap transition-all">
              {{ cat.label }}
          </button>
      </div>

      <!-- Catalog Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         <div *ngFor="let item of filteredRewards" class="glass-card group relative overflow-hidden flex flex-col h-full hover:border-brand-primary/50 transition-colors">
             <!-- Image Area -->
             <div class="h-48 bg-slate-800 overflow-hidden relative">
                 <img [src]="getImage(item)" alt="{{ item.name }}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                 <div class="absolute top-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-warning border border-brand-warning/30">
                     {{ item.pointsCost | number }} Pts
                 </div>
             </div>
             
             <!-- Content -->
             <div class="p-5 flex-1 flex flex-col">
                 <div class="text-xs text-brand-primary font-bold uppercase tracking-wider mb-1">{{ formatCategory(item.category) }}</div>
                 <h3 class="text-lg font-bold text-white mb-2 line-clamp-2">{{ item.name }}</h3>
                 <div class="flex-1"></div> <!-- Spacer -->
                 
                 <div class="text-xs text-slate-500 mt-2">
                    Access via a Customer Profile to redeem this reward.
                 </div>
             </div>
         </div>
      </div>
      
      <div *ngIf="loading" class="text-center py-20">
          <div class="animate-spin w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-slate-400">Loading rewards...</p>
      </div>

      <div *ngIf="!loading && rewards.length > 0 && filteredRewards.length === 0" class="text-center py-20">
          <i class="ph ph-magnifying-glass text-6xl text-slate-700 mb-4 block"></i>
          <p class="text-slate-400">No rewards found in this category.</p>
      </div>
    </div>
  `
})
export class RewardCatalogComponent implements OnInit {
    rewards: RewardItem[] = [];
    loading = true;
    categories = [
        { label: 'All', value: 'All' },
        { label: 'Gift Cards', value: 'GIFT_CARDS' },
        { label: 'Travel', value: 'TRAVEL_HOLIDAYS' },
        { label: 'Electronics', value: 'SHOPPING_ELECTRONICS' },
        { label: 'Dining', value: 'DINING_LIFESTYLE' },
        { label: 'Fitness', value: 'HEALTH_FITNESS' },
        { label: 'Learning', value: 'LEARNING_SUBSCRIPTIONS' }
    ];
    selectedCategory = 'All';

    constructor(private rewardService: RewardService) { }

    ngOnInit() {
        this.rewardService.getRewardCatalog().subscribe({
            next: (items) => {
                this.rewards = items;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    get filteredRewards(): RewardItem[] {
        if (this.selectedCategory === 'All') return this.rewards;
        return this.rewards.filter(item => item.category === this.selectedCategory);
    }

    formatCategory(cat: string): string {
        const found = this.categories.find(c => c.value === cat);
        return found ? found.label : cat;
    }

    getImage(item: RewardItem): string {
        const name = item.name.toLowerCase();
        if (name.includes('google')) return 'https://placehold.co/400x300/101827/FFF?text=Google+Play';
        if (name.includes('apple')) return 'https://placehold.co/400x300/101827/FFF?text=Apple+Card';
        if (name.includes('amazon')) return 'https://placehold.co/400x300/101827/FFF?text=Amazon';
        if (name.includes('swiggy')) return 'https://placehold.co/400x300/101827/FFF?text=Swiggy';
        if (name.includes('zomato')) return 'https://placehold.co/400x300/101827/FFF?text=Zomato';

        const cat = item.category;
        if (cat === 'TRAVEL_HOLIDAYS') return 'https://placehold.co/400x300/101827/FFF?text=Travel';
        if (cat === 'SHOPPING_ELECTRONICS') return 'https://placehold.co/400x300/101827/FFF?text=Electronics';
        if (cat === 'DINING_LIFESTYLE') return 'https://placehold.co/400x300/101827/FFF?text=Dining';
        if (cat === 'HEALTH_FITNESS') return 'https://placehold.co/400x300/101827/FFF?text=Fitness';
        if (cat === 'LEARNING_SUBSCRIPTIONS') return 'https://placehold.co/400x300/101827/FFF?text=Learning';

        return 'https://placehold.co/400x300/101827/FFF?text=Gift+Card';
    }
}
