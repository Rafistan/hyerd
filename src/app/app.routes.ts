import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'directory',
    loadComponent: () => import('@features/directory/directory-list/directory-list.component').then(m => m.DirectoryListComponent),
  },
  {
    path: 'directory/:id',
    loadComponent: () => import('@features/directory/directory-detail/directory-detail.component').then(m => m.DirectoryDetailComponent),
  },
  {
    path: 'jobs',
    loadComponent: () => import('@features/jobs/jobs-list/jobs-list.component').then(m => m.JobsListComponent),
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('@features/jobs/job-detail/job-detail.component').then(m => m.JobDetailComponent),
  },
  {
    path: 'housing',
    loadComponent: () => import('@features/housing/housing-list/housing-list.component').then(m => m.HousingListComponent),
  },
  {
    path: 'housing/:id',
    loadComponent: () => import('@features/housing/housing-detail/housing-detail.component').then(m => m.HousingDetailComponent),
  },
  {
    path: 'cars',
    loadComponent: () => import('@features/cars/cars-list/cars-list.component').then(m => m.CarsListComponent),
  },
  {
    path: 'cars/:id',
    loadComponent: () => import('@features/cars/car-detail/car-detail.component').then(m => m.CarDetailComponent),
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/events-list.component').then(m => m.EventsListComponent),
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./features/events/event-detail.component').then(m => m.EventDetailComponent),
  },
  {
    path: 'marketplace',
    loadComponent: () => import('@features/marketplace/marketplace-list/marketplace-list.component').then(m => m.MarketplaceListComponent),
  },
  {
    path: 'marketplace/:id',
    loadComponent: () => import('@features/marketplace/marketplace-detail/marketplace-detail.component').then(m => m.MarketplaceDetailComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'listings/new',
    loadComponent: () => import('./features/listings/new-listing.component').then(m => m.NewListingComponent),
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messaging/messaging.component').then(m => m.MessagingComponent),
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
