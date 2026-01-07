import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-screen bg-brand-darker flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/20 rounded-full blur-[100px]"></div>
      </div>

      <div class="glass-card w-full max-w-md p-8 z-10 relative">
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/20">
            <i class="ph ph-bank text-3xl text-white"></i>
          </div>
          <h2 class="text-3xl font-bold text-white mb-2">CES Reward Portal</h2>
          <p class="text-slate-400">Internal Banking System</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-300">Username</label>
            <div class="relative">
              <i class="ph ph-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
              <input 
                type="text" 
                [(ngModel)]="username" 
                name="username"
                class="input-primary pl-11"
                placeholder="Enter your specific ID"
                required
              >
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-300">Password</label>
            <div class="relative">
              <i class="ph ph-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password"
                class="input-primary pl-11"
                placeholder="••••••••"
                required
              >
            </div>
          </div>

          <div *ngIf="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <i class="ph ph-warning-circle"></i>
            {{ error }}
          </div>

          <button 
            type="submit" 
            [disabled]="isLoading"
            class="btn-primary w-full flex items-center justify-center gap-2"
          >
            <span *ngIf="isLoading" class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
            <span *ngIf="!isLoading">Access Portal</span>
            <i *ngIf="!isLoading" class="ph ph-arrow-right"></i>
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-slate-500">
          Authorized Personnel Only • Secure Connection
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
    username = '';
    password = '';
    isLoading = false;
    error = '';

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        if (!this.username || !this.password) {
            this.error = 'Please enter both username and password';
            return;
        }

        this.isLoading = true;
        this.error = '';

        this.authService.login({ username: this.username, password: this.password }).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.isLoading = false;
                this.error = 'Invalid credentials or server error';
                console.error(err);
            }
        });
    }
}
