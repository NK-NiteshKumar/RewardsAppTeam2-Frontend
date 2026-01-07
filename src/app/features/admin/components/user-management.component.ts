import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white">CES User Management</h2>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Create User Form -->
          <div class="glass-card p-6">
              <h3 class="text-lg font-semibold text-white mb-4">Create New User</h3>
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
                  <div class="space-y-2">
                      <label class="text-sm text-slate-400">Username</label>
                      <input type="text" formControlName="username" class="input-primary" placeholder="e.g. john.doe">
                  </div>
                  
                  <div class="space-y-2">
                      <label class="text-sm text-slate-400">Password</label>
                      <input type="password" formControlName="password" class="input-primary" placeholder="•••••••">
                  </div>

                  <div class="space-y-2">
                       <label class="text-sm text-slate-400">Role</label>
                       <select formControlName="role" class="input-primary">
                           <option value="CES">CES User</option>
                           <option value="ADMIN_CES">Admin CES</option>
                       </select>
                  </div>
                  
                  <button type="submit" [disabled]="submitting" class="btn-primary w-full mt-2">
                      {{ submitting ? 'Creating...' : 'Create User' }}
                  </button>
                  
                  <div *ngIf="error" class="text-red-400 text-sm text-center">{{ error }}</div>
              </form>
          </div>

          <!-- User List -->
          <div class="lg:col-span-2 glass-card overflow-hidden">
               <div class="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                   <h3 class="text-lg font-semibold text-white">Existing Users</h3>
                   <button (click)="loadUsers()" class="text-brand-primary p-2 hover:bg-white/5 rounded-lg transition-colors">
                       <i class="ph ph-arrow-clockwise text-lg"></i>
                   </button>
               </div>
               
               <table class="w-full text-sm text-left text-slate-400">
                   <thead class="bg-white/5 text-xs uppercase text-slate-300">
                       <tr>
                           <th class="px-6 py-3">ID</th>
                           <th class="px-6 py-3">Username</th>
                           <th class="px-6 py-3">Role</th>
                           <th class="px-6 py-3 text-right">Actions</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr *ngFor="let user of users" class="border-b border-white/5 hover:bg-white/5">
                           <td class="px-6 py-4">#{{ user.id }}</td>
                           <td class="px-6 py-4 font-medium text-white">{{ user.username }}</td>
                           <td class="px-6 py-4">
                               <span [ngClass]="{'text-brand-accent': user.role === 'ADMIN_CES', 'text-slate-400': user.role !== 'ADMIN_CES'}" class="font-bold text-xs uppercase">
                                   {{ user.role }}
                               </span>
                           </td>
                           <td class="px-6 py-4 text-right">
                               <button (click)="deleteUser(user.id)" class="text-slate-500 hover:text-red-400 transition-colors">
                                   <i class="ph ph-trash text-lg"></i>
                               </button>
                           </td>
                       </tr>
                   </tbody>
               </table>
               
               <div *ngIf="users.length === 0" class="text-center py-8 text-slate-500">
                   No users found.
               </div>
          </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
    users: any[] = [];
    form: FormGroup;
    submitting = false;
    error = '';

    constructor(
        private fb: FormBuilder,
        private adminService: AdminService,
        private authService: AuthService
    ) {
        this.form = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
            role: ['CES', Validators.required]
        });
    }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.adminService.getAllUsers().subscribe((data) => {
            this.users = data;
        }, (err) => console.error(err));
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.submitting = true;
        this.error = '';

        this.adminService.createCesUser(this.form.value).subscribe({
            next: () => {
                this.submitting = false;
                this.form.reset({ role: 'CES' });
                this.loadUsers();
            },
            error: (err) => {
                this.submitting = false;
                this.error = err.error?.message || 'Failed to create user';
            }
        });
    }

    deleteUser(id: number) {
        // Find the user to be deleted to check their username
        const userToDelete = this.users.find(u => u.id === id);

        this.authService.user$.pipe(take(1)).subscribe(currentUser => {
            if (currentUser && userToDelete && currentUser.username === userToDelete.username) {
                alert('You cannot delete your own administrative account.');
                return;
            }

            if (confirm(`Are you sure you want to delete user "${userToDelete?.username}"?`)) {
                this.adminService.deleteCesUser(id).subscribe(() => {
                    this.loadUsers();
                });
            }
        });
    }
}
