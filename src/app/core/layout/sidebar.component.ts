import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 h-screen bg-brand-darker border-r border-white/5 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-white/5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center mr-3 shadow-lg shadow-brand-primary/20">
          <i class="ph ph-bank text-white text-lg"></i>
        </div>
        <div>
          <h1 class="text-white font-bold text-lg tracking-tight">CES Portal</h1>
          <p class="text-xs text-slate-500 uppercase tracking-wider">Reward System</p>
        </div>
      </div>

      <!-- User Info -->
      <div class="px-6 py-6" *ngIf="user$ | async as user">
        <div class="flex items-center p-3 rounded-xl bg-slate-800/50 border border-white/5">
          <div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-lg mr-3">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
          <div class="overflow-hidden">
            <div class="text-sm font-medium text-white truncate">{{ user.username }}</div>
            <div class="text-xs text-brand-primary truncate">{{ user.role }}</div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-1">
        
        <a routerLink="/dashboard" routerLinkActive="bg-brand-primary/10 text-brand-primary border-r-2 border-brand-primary" class="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <i class="ph ph-squares-four text-xl mr-3 group-hover:scale-110 transition-transform"></i>
          <span class="font-medium">Dashboard</span>
        </a>

        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-widest">Client Management</div>

        <a routerLink="/customers" routerLinkActive="bg-brand-primary/10 text-brand-primary border-r-2 border-brand-primary" class="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <i class="ph ph-users text-xl mr-3 group-hover:scale-110 transition-transform"></i>
          <span class="font-medium">Customers</span>
        </a>

        <!-- Add more links conditionally if needed or grouping -->
        
        <div class="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-widest">Reward Operations</div>

        <a routerLink="/rewards/catalog" routerLinkActive="bg-brand-primary/10 text-brand-primary border-r-2 border-brand-primary" class="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <i class="ph ph-gift text-xl mr-3 group-hover:scale-110 transition-transform"></i>
          <span class="font-medium">Catalog</span>
        </a>
        
        <div *ngIf="isAdmin()" class="pt-4 pb-2 px-4 text-xs font-semibold text-slate-600 uppercase tracking-widest">Administration</div>

        <a *ngIf="isAdmin()" routerLink="/admin/users" routerLinkActive="bg-brand-primary/10 text-brand-primary border-r-2 border-brand-primary" class="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
          <i class="ph ph-user-gear text-xl mr-3 group-hover:scale-110 transition-transform"></i>
          <span class="font-medium">CES Users</span>
        </a>

      </nav>

      <!-- Logout -->
      <div class="p-4 border-t border-white/5">
        <button (click)="logout()" class="w-full flex items-center px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all group">
          <i class="ph ph-sign-out text-xl mr-3 group-hover:-translate-x-1 transition-transform"></i>
          <span class="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  user$ = this.authService.user$;

  constructor(private authService: AuthService) { }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout() {
    this.authService.logout();
  }
}
