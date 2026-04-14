import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ScrollAnimateDirective } from '@shared/directives/scroll-animate.directive';

interface Business {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  description: string;
  verified: boolean;
  tags: string[];
  gradient: string;
  initials: string;
}

@Component({
  selector: 'app-directory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ScrollAnimateDirective],
  templateUrl: './directory-list.component.html',
  styleUrl: './directory-list.component.scss',
})
export class DirectoryListComponent implements OnInit {
  searchQuery = '';
  locationFilter = signal('');
  sortBy = 'rating';
  verifiedOnlyModel = false;
  gridView = signal(true);
  sidebarOpen = signal(false);
  selectedCategories = signal<string[]>([]);
  minRating = signal(0);
  verifiedOnly = signal(false);

  categories = ['Restaurant', 'Retail', 'Professional Services', 'Healthcare', 'Education', 'Entertainment', 'Construction', 'Automotive'];

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  businesses = signal<Business[]>([]);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['q']) this.searchQuery = params['q'];
    if (params['location']) this.locationFilter.set(params['location']);
    this.loading.set(true);
    this.api.getListings({ listing_type_slug: 'businesses' }).subscribe({
      next: (res) => {
        const gradients = [
          'linear-gradient(135deg, #B5261E 0%, #6B0F0A 100%)',
          'linear-gradient(135deg, #0F3460 0%, #1a1a2e 100%)',
          'linear-gradient(135deg, #D4822A 0%, #8B4500 100%)',
          'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
          'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
          'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        ];
        this.businesses.set(res.data.map((l: Listing, i: number) => ({
          id: l.id as any,
          name: l.title,
          category: l.categories?.label ?? l.metadata?.['category'] ?? 'Other',
          rating: l.metadata?.['rating'] ?? 0,
          reviewCount: l.metadata?.['review_count'] ?? 0,
          location: l.city,
          phone: l.contact_phone,
          description: l.description,
          verified: l.metadata?.['verified'] ?? false,
          tags: l.tags ?? [],
          gradient: gradients[i % gradients.length],
          initials: l.title.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load businesses.');
        this.loading.set(false);
      },
    });
  }

  filteredBusinesses = computed(() => {
    let items = this.businesses();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
    }
    if (this.locationFilter().trim()) {
      const loc = this.locationFilter().toLowerCase();
      items = items.filter(b => b.location.toLowerCase().includes(loc));
    }
    if (this.selectedCategories().length > 0) {
      items = items.filter(b => this.selectedCategories().includes(b.category));
    }
    if (this.minRating() > 0) {
      items = items.filter(b => b.rating >= this.minRating());
    }
    if (this.verifiedOnly()) {
      items = items.filter(b => b.verified);
    }
    if (this.sortBy === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    else if (this.sortBy === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
    else if (this.sortBy === 'reviews') items = [...items].sort((a, b) => b.reviewCount - a.reviewCount);
    return items;
  });

  activeFilterCount = computed(() => {
    let count = this.selectedCategories().length;
    if (this.minRating() > 0) count++;
    if (this.verifiedOnly()) count++;
    return count;
  });

  toggleCategory(cat: string) {
    this.selectedCategories.update(cats =>
      cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat]
    );
  }

  clearFilters() {
    this.selectedCategories.set([]);
    this.minRating.set(0);
    this.verifiedOnly.set(false);
    this.verifiedOnlyModel = false;
    this.searchQuery = '';
    this.locationFilter.set('');
  }
}
