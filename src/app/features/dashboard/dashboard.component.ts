import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { RewardService } from '../../core/services/reward.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-white">Dashboard</h2>
        <div class="text-sm text-slate-400" *ngIf="user$ | async as user">
            Welcome back, {{ user.username }} ({{ user.role }})
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Stat Card 1 -->
        <div class="glass-card p-6 relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <i class="ph ph-users text-8xl text-brand-primary"></i>
          </div>
          <div class="relative z-10">
            <div class="text-slate-400 text-sm font-medium mb-1">Total Customers</div>
            <div class="text-3xl font-bold text-white">{{ stats.totalCustomers }}</div>
            <div class="mt-2 text-xs text-brand-success flex items-center">
              <i class="ph ph-trend-up mr-1"></i> Real-time data
            </div>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div class="glass-card p-6 relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <i class="ph ph-package text-8xl text-brand-accent"></i>
          </div>
          <div class="relative z-10">
            <div class="text-slate-400 text-sm font-medium mb-1">Reward Items</div>
            <div class="text-3xl font-bold text-white">{{ stats.rewardItems }}</div>
            <div class="mt-2 text-xs text-brand-success flex items-center">
              <i class="ph ph-check-circle mr-1"></i> Active in catalog
            </div>
          </div>
        </div>

         <!-- Stat Card 3 -->
        <div class="glass-card p-6 relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <i class="ph ph-user-gear text-8xl text-brand-warning"></i>
          </div>
          <div class="relative z-10">
            <div class="text-slate-400 text-sm font-medium mb-1">CES Users</div>
            <div class="text-3xl font-bold text-white">{{ stats.cesUsers }}</div>
            <div class="mt-2 text-xs text-slate-500 flex items-center">
              <i class="ph ph-info mr-1"></i> Management portal
            </div>
          </div>
        </div>

        <!-- Stat Card 4 -->
        <div class="glass-card p-6 relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <i class="ph ph-gift text-8xl text-pink-500"></i>
          </div>
          <div class="relative z-10">
            <div class="text-slate-400 text-sm font-medium mb-1">Recent Redemptions</div>
            <div class="text-3xl font-bold text-white">Live</div>
            <div class="mt-2 text-xs text-slate-500 flex items-center">
              System active
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div class="flex flex-wrap gap-4">
            <button routerLink="/customers" class="btn-primary flex items-center gap-2">
                <i class="ph ph-users"></i> Manage Customers
            </button>
            <button routerLink="/customers/new" class="px-6 py-3 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2">
                <i class="ph ph-user-plus"></i> Register Customer
            </button>
            <button routerLink="/rewards/catalog" class="px-6 py-3 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2">
                <i class="ph ph-package"></i> View Catalog
            </button>
        </div>
      </div>
    </div>
    `
})
export class DashboardComponent implements OnInit {
  user$ = this.authService.user$;
  stats = {
    totalCustomers: 0,
    rewardItems: 0,
    cesUsers: 0
  };

  constructor(
    private customerService: CustomerService,
    private rewardService: RewardService,
    private authService: AuthService,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    const stats$ = {
      customers: this.customerService.getCustomers(0, 1),
      rewards: this.rewardService.getRewardCatalog(),
    };

    if (this.authService.isAdmin()) {
      (stats$ as any).users = this.adminService.getAllUsers();
    }

    forkJoin(stats$).subscribe({
      next: (data: any) => {
        this.stats.totalCustomers = data.customers.totalElements;
        this.stats.rewardItems = data.rewards.length;
        if (data.users) {
          this.stats.cesUsers = data.users.length;
        }
      },
      error: (err) => console.error('Error loading dashboard stats', err)
    });
  }
}
