import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Listing as ApiListing, Profile } from '../../core/models';

interface Listing {
  id: string;
  title: string;
  category: string;
  listingTypeSlug: string;
  status: 'Active' | 'Pending' | 'Expired';
  views: number;
  date: string;
  categoryColor: string;
}

interface Activity {
  icon: string;
  iconColor: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: 'dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(ApiService);

  Math = Math;
  activeTab = signal<string>('overview');
  profile = signal<Profile | null>(null);

  memberSince = computed(() => {
    const p = this.profile();
    if (!p) return '—';
    return new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  firstName = computed(() => this.profile()?.full_name?.split(' ')[0] ?? '');

  userEmail = signal('');

  // Settings form fields
  settingsFullName = '';
  settingsBio = '';
  settingsCity = '';
  savingSettings = false;
  settingsSaved = false;

  sidebarItems: { tab: string; label: string; icon: string; badge: string | null }[] = [
    { tab: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2', badge: null },
    { tab: 'listings', label: 'My Listings', icon: 'bi bi-layout-text-sidebar', badge: null },
    { tab: 'saved', label: 'Saved', icon: 'bi bi-bookmark', badge: null },
    { tab: 'reviews', label: 'Reviews', icon: 'bi bi-star', badge: null },
    { tab: 'settings', label: 'Settings', icon: 'bi bi-gear', badge: null },
  ];

  stats = [
    {
      label: 'Active Listings',
      value: '0',
      icon: 'bi bi-layout-text-sidebar',
      trend: 0,
      color: 'var(--hy-pomegranate)'
    },
    { label: 'Total Views', value: '0', icon: 'bi bi-eye', trend: 0, color: '#1A4FA0' },
    { label: 'Messages', value: '—', icon: 'bi bi-chat-dots', trend: 0, color: '#1E7A50' },
    { label: 'Reviews', value: '—', icon: 'bi bi-star', trend: 0, color: '#D4822A' },
  ];

  recentActivity: Activity[] = [];

  quickActions = [
    {
      label: 'Post a new listing',
      route: '/listings/new',
      icon: 'bi bi-plus-square',
      color: 'linear-gradient(135deg, #B5261E, #D4822A)'
    },
    {
      label: 'Browse job opportunities',
      route: '/jobs',
      icon: 'bi bi-briefcase',
      color: 'linear-gradient(135deg, #1A4FA0, #3B7DD8)'
    },
    {
      label: 'Find housing nearby',
      route: '/housing',
      icon: 'bi bi-house',
      color: 'linear-gradient(135deg, #1E7A50, #28A869)'
    },
    {
      label: 'Discover events this week',
      route: '/events',
      icon: 'bi bi-calendar-event',
      color: 'linear-gradient(135deg, #D4822A, #F0A84E)'
    },
  ];

  listings: Listing[] = [];

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      if (user) this.userEmail.set(user.email ?? '');
    });

    this.api.getMyProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.settingsFullName = p.full_name ?? '';
        this.settingsBio = p.bio ?? '';
        this.settingsCity = p.city ?? '';
      },
    });

    this.api.getMyListings().subscribe({
      next: (data: ApiListing[]) => {
        const colors: Record<string, string> = {
          marketplace: '#1A4FA0', jobs: '#D4822A', housing: '#1E7A50',
          businesses: '#B5261E', events: '#7A3B8C', cars: '#0F3460',
        };
        this.listings = data.map(l => ({
          id: l.id,
          title: l.title,
          category: l.listing_types?.label ?? l.listing_type_id,
          listingTypeSlug: l.listing_types?.slug ?? 'marketplace',
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1) as any,
          views: l.view_count,
          date: l.created_at.split('T')[0],
          categoryColor: colors[l.listing_types?.slug ?? ''] ?? '#1A4FA0',
        }));
        const activeCount = data.filter(l => l.status === 'active').length;
        const totalViews = data.reduce((sum, l) => sum + l.view_count, 0);
        this.stats[0].value = String(activeCount);
        this.stats[1].value = totalViews.toLocaleString();
        this.sidebarItems[1].badge = data.length > 0 ? String(data.length) : null;
      },
    });
  }

  listingRoute(listing: Listing): string[] {
    const slugToPath: Record<string, string> = {
      businesses: 'directory',
      jobs: 'jobs',
      housing: 'housing',
      cars: 'cars',
      events: 'events',
      marketplace: 'marketplace',
    };
    const path = slugToPath[listing.listingTypeSlug] ?? 'marketplace';
    return ['/' + path, listing.id];
  }

  saveSettings(): void {
    this.savingSettings = true;
    this.api.updateMyProfile({
      full_name: this.settingsFullName,
      bio: this.settingsBio,
      city: this.settingsCity,
    }).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.savingSettings = false;
        this.settingsSaved = true;
        setTimeout(() => (this.settingsSaved = false), 3000);
      },
      error: () => {
        this.savingSettings = false;
      },
    });
  }
}
