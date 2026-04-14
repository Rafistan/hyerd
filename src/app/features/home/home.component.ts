import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';
import { ApiService } from '../../core/services/api.service';

interface Category {
  name: string;
  description: string;
  icon: string;
  count: string;
  route: string;
  color: string;
  accentColor: string;
}

interface FeaturedBusiness {
  id: string;
  name: string;
  category: string;
  location: string;
  initial: string;
  gradient: string;
}

interface RecentJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  typeColor: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

interface Stat {
  value: string;
  suffix: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ScrollAnimateDirective],
  templateUrl: 'home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  activeSearchTab = signal(0);

  searchTabs = ['All', 'Directory', 'Jobs', 'Housing', 'Cars', 'Events'];

  hotSearches = ['Restaurants', 'Tech jobs', 'Apartments', 'Events LA', 'Armenian tutors'];

  // Static marketing stats — no DB equivalent for member count
  stats: Stat[] = [
    { value: '50', suffix: 'K+', label: 'Community Members', icon: 'bi bi-people-fill' },
    { value: '—', suffix: '', label: 'Businesses Listed', icon: 'bi bi-building' },
    { value: '—', suffix: '', label: 'Active Job Listings', icon: 'bi bi-briefcase-fill' },
    { value: '—', suffix: '', label: 'Events Monthly', icon: 'bi bi-calendar-event-fill' },
  ];

  categories: Category[] = [
    {
      name: 'Business Directory',
      description: 'Find and explore verified Armenian-owned businesses near you',
      icon: 'bi bi-building',
      count: '…',
      route: '/directory',
      color: 'linear-gradient(135deg, #B5261E, #D4822A)',
      accentColor: '#B5261E',
    },
    {
      name: 'Jobs Board',
      description: 'Browse opportunities posted by Armenian community employers',
      icon: 'bi bi-briefcase',
      count: '…',
      route: '/jobs',
      color: 'linear-gradient(135deg, #1A4FA0, #3B7DD8)',
      accentColor: '#1A4FA0',
    },
    {
      name: 'Housing',
      description: 'Find apartments, homes, and rooms for rent or sale',
      icon: 'bi bi-house',
      count: '…',
      route: '/housing',
      color: 'linear-gradient(135deg, #1E7A50, #28A869)',
      accentColor: '#1E7A50',
    },
    {
      name: 'Cars',
      description: 'Buy and sell vehicles within the Armenian community',
      icon: 'bi bi-car-front',
      count: '…',
      route: '/cars',
      color: 'linear-gradient(135deg, #7A3B8C, #A855F7)',
      accentColor: '#7A3B8C',
    },
    {
      name: 'Events',
      description: 'Discover cultural gatherings, festivals & community events',
      icon: 'bi bi-calendar-event',
      count: '…',
      route: '/events',
      color: 'linear-gradient(135deg, #D4822A, #F0A84E)',
      accentColor: '#D4822A',
    },
    {
      name: 'Marketplace',
      description: 'Buy and sell goods, crafts & services in the community',
      icon: 'bi bi-shop',
      count: '…',
      route: '/marketplace',
      color: 'linear-gradient(135deg, #2D6A6A, #3AABAB)',
      accentColor: '#2D6A6A',
    },
  ];

  featuredBusinesses: FeaturedBusiness[] = [];
  recentJobs: RecentJob[] = [];

  testimonials: Testimonial[] = [
    {
      quote:
        'Hyerd helped me find my dream apartment in Glendale in less than a week. The community here is warm and trustworthy.',
      name: 'Anahit Kazarian',
      role: 'Found housing through Hyerd',
      initials: 'AK',
      color: 'linear-gradient(135deg, #B5261E, #D4822A)',
    },
    {
      quote:
        'I posted my restaurant on Hyerd and saw a 40% increase in customers within the first month. Incredible platform.',
      name: 'Levon Petrosyan',
      role: 'Owner, Yerevan Kitchen',
      initials: 'LP',
      color: 'linear-gradient(135deg, #1A4FA0, #3B7DD8)',
    },
    {
      quote:
        "Found my current job through Hyerd's job board. The connections I've made with the Armenian business community are priceless.",
      name: 'Silva Abrahamyan',
      role: 'Product Manager at Arev Tech',
      initials: 'SA',
      color: 'linear-gradient(135deg, #1E7A50, #28A869)',
    },
  ];

  ngOnInit(): void {
    const bizGradients = [
      'linear-gradient(135deg, #8B1A14, #C0392B)',
      'linear-gradient(135deg, #1A3A6E, #2E6DB4)',
      'linear-gradient(135deg, #1E5A3A, #2E8B57)',
      'linear-gradient(135deg, #4A1A6E, #7B2FBE)',
    ];

    const jobTypeColors: Record<string, string> = {
      'full-time': '#1E7A50',
      'part-time': '#1A4FA0',
      'contract': '#D4822A',
      'remote': '#7A3B8C',
      'freelance': '#7A3B8C',
    };

    forkJoin({
      directory: this.api.getListings({ listing_type_slug: 'directory', limit: 4, status: 'active' }),
      jobs: this.api.getListings({ listing_type_slug: 'jobs', limit: 4, status: 'active' }),
      housing: this.api.getListings({ listing_type_slug: 'housing', limit: 1, status: 'active' }),
      cars: this.api.getListings({ listing_type_slug: 'cars', limit: 1, status: 'active' }),
      events: this.api.getListings({ listing_type_slug: 'events', limit: 1, status: 'active' }),
      marketplace: this.api.getListings({ listing_type_slug: 'marketplace', limit: 1, status: 'active' }),
    }).subscribe(({ directory, jobs, housing, cars, events, marketplace }) => {
      // Update category counts with real totals
      const totals: Record<string, number> = {
        '/directory': directory.total,
        '/jobs': jobs.total,
        '/housing': housing.total,
        '/cars': cars.total,
        '/events': events.total,
        '/marketplace': marketplace.total,
      };
      this.categories = this.categories.map(cat => ({
        ...cat,
        count: this.formatCount(totals[cat.route] ?? 0),
      }));

      // Update stats ticker for the categories we have real counts for
      this.stats = [
        { value: '50', suffix: 'K+', label: 'Community Members', icon: 'bi bi-people-fill' },
        { ...this.formatStat(directory.total), label: 'Businesses Listed', icon: 'bi bi-building' },
        { ...this.formatStat(jobs.total), label: 'Active Job Listings', icon: 'bi bi-briefcase-fill' },
        { ...this.formatStat(events.total), label: 'Events Monthly', icon: 'bi bi-calendar-event-fill' },
      ];

      // Featured businesses from top 4 directory listings
      this.featuredBusinesses = directory.data.map((l, i) => ({
        id: l.id,
        name: l.title,
        category: l.categories?.label ?? l.listing_types?.label ?? 'Business',
        location: l.city,
        initial: l.title.charAt(0).toUpperCase(),
        gradient: bizGradients[i % bizGradients.length],
      }));

      // Recent jobs from top 4 job listings
      this.recentJobs = jobs.data.map(l => {
        const rawType = (l.metadata?.['job_type'] as string | undefined) ?? 'Full-time';
        const typeKey = rawType.toLowerCase().replace(/\s+/g, '-');
        return {
          id: l.id,
          title: l.title,
          company: (l.metadata?.['company_name'] as string | undefined)
            ?? l.profiles?.full_name
            ?? 'Company',
          location: l.city,
          type: rawType,
          salary: l.listing_price_label
            ?? (l.listing_price ? `$${ l.listing_price.toLocaleString() }` : 'Negotiable'),
          typeColor: jobTypeColors[typeKey] ?? '#1E7A50',
        };
      });
    });
  }

  onSearch(location: string, keyword: string): void {
    const tabRoutes: Record<string, string> = {
      'All': '/directory',
      'Directory': '/directory',
      'Jobs': '/jobs',
      'Housing': '/housing',
      'Cars': '/cars',
      'Events': '/events',
    };
    const route = tabRoutes[this.searchTabs[this.activeSearchTab()]] ?? '/directory';
    const queryParams: Record<string, string> = {};
    if (keyword.trim()) queryParams['q'] = keyword.trim();
    if (location.trim()) queryParams['location'] = location.trim();
    void this.router.navigate([route], { queryParams });
  }

  private formatCount(n: number): string {
    if (n >= 1000) return `${ Math.round(n / 1000) }K+`;
    return `${ n }+`;
  }

  private formatStat(n: number): { value: string; suffix: string } {
    if (n >= 1000) return { value: String(Math.round(n / 1000)), suffix: 'K+' };
    return { value: String(n), suffix: '+' };
  }
}
