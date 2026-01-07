import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { LoginComponent } from './features/auth/components/login.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'customers',
                loadComponent: () => import('./features/customer/components/customer-list.component').then(m => m.CustomerListComponent)
            },
            {
                path: 'customers/new',
                loadComponent: () => import('./features/customer/components/customer-create.component').then(m => m.CustomerCreateComponent)
            },
            {
                path: 'customers/:id',
                loadComponent: () => import('./features/customer/components/customer-profile.component').then(m => m.CustomerProfileComponent)
            },
            {
                path: 'customers/:id/rewards',
                loadComponent: () => import('./features/customer/components/customer-rewards.component').then(m => m.CustomerRewardsComponent)
            },
            {
                path: 'customers/:id/cart',
                loadComponent: () => import('./features/reward/components/reward-cart.component').then(m => m.RewardCartComponent)
            },
            {
                path: 'rewards/catalog',
                loadComponent: () => import('./features/reward/components/reward-catalog.component').then(m => m.RewardCatalogComponent)
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./features/admin/components/user-management.component').then(m => m.UserManagementComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login' // or 404
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
