import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarComponent],
    template: `
    <div class="flex h-screen bg-slate-900 text-slate-200 font-sans antialiased overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Content -->
      <main class="flex-1 ml-64 h-full relative overflow-y-auto custom-scrollbar">
        <!-- Header / Topbar could go here if needed -->
        <div class="p-8 pb-20 min-h-full">
           <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class MainLayoutComponent { }
