import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-4 mb-8">
        <button routerLink="/customers" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors">
          <i class="ph ph-arrow-left text-lg"></i>
        </button>
        <div>
           <h2 class="text-2xl font-bold text-white">Register Customer</h2>
           <p class="text-slate-400 text-sm">Add a new client to the banking system</p>
        </div>
      </div>

      <div class="glass-card p-6 md:p-8">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-300">First Name</label>
              <input type="text" formControlName="firstName" class="input-primary" placeholder="e.g. John">
              <div *ngIf="submitted && f['firstName'].errors" class="text-red-400 text-xs">Required</div>
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-300">Last Name</label>
              <input type="text" formControlName="lastName" class="input-primary" placeholder="e.g. Doe">
              <div *ngIf="submitted && f['lastName'].errors" class="text-red-400 text-xs">Required</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-300">Email Address</label>
              <input type="email" formControlName="email" class="input-primary" placeholder="john@example.com">
              <div *ngIf="submitted && f['email'].errors" class="text-red-400 text-xs">Valid email required</div>
            </div>
            
             <div class="space-y-2">
                <label class="text-sm font-medium text-slate-300">Phone Number</label>
                <input type="text" formControlName="phoneNo" class="input-primary" placeholder="10 Digit Number">
                <div *ngIf="submitted && f['phoneNo'].errors" class="text-red-400 text-xs">
                  <span *ngIf="f['phoneNo'].errors['required']">Required</span>
                  <span *ngIf="f['phoneNo'].errors['pattern']">Must be exactly 10 digits</span>
                </div>
             </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="space-y-2">
               <label class="text-sm font-medium text-slate-300">Date of Birth</label>
               <input type="date" formControlName="dob" class="input-primary text-slate-400">
               <div *ngIf="submitted && f['dob'].errors" class="text-red-400 text-xs text-center">Required</div>
             </div>

             <div class="space-y-2">
               <label class="text-sm font-medium text-slate-300">Date of Joining</label>
               <input type="date" formControlName="doj" class="input-primary text-slate-400">
               <span class="text-[10px] text-slate-500 italic block mt-1">Leave empty for today's date</span>
             </div>
          </div>


          <!-- Actions -->
          <div class="pt-4 flex items-center justify-end gap-3">
             <button type="button" routerLink="/customers" class="px-6 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
             <button type="submit" [disabled]="submitting" class="btn-primary flex items-center gap-2">
               <span *ngIf="submitting" class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
               {{ submitting ? 'Registering...' : 'Complete Registration' }}
             </button>
          </div>

          <div *ngIf="error" class="text-center text-red-400 text-sm mt-2">{{ error }}</div>

        </form>
      </div>
    </div>
  `
})
export class CustomerCreateComponent {
  form: FormGroup;
  submitted = false;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dob: ['', Validators.required],
      doj: ['']
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.error = '';

    // Age Validation Logic
    const dob = new Date(this.form.value.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      this.error = "🚫 Access Denied: We value our young fans, but you must be at least 18 years old to open a credit card account.";
      return;
    }

    if (age > 120) {
      this.error = "🎩 🧙‍♂️ Impressive! You've likely seen empires rise and fall, but our banking system is too young for a legend like you. (Wait, are you a vampire?)";
      return;
    }

    this.submitting = true;

    this.customerService.createCustomer(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Failed to create customer';
      }
    });
  }
}
