import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MarketplaceItem {
  id: number;
  title: string;
  price: number;
  image: string;
  condition: 'New' | 'Like New' | 'Used' | 'Good';
  seller: string;
  postedDate: string;
  location: string;
  category: string;
}

@Component({
  selector: 'app-marketplace-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './marketplace-list.component.html',
  styleUrl: './marketplace-list.component.scss',
})
export class MarketplaceListComponent implements OnInit {
  private api = inject(ApiService);

  mockItems: MarketplaceItem[] = [];

  categories = ['All', 'Electronics', 'Furniture', 'Clothing', 'Sports', 'Home & Garden', 'Books', 'Other'];
  selectedCategory = 'All';
  searchQuery = '';
  sortBy = 'newest';
  filteredItems: MarketplaceItem[] = [];

  ngOnInit() {
    this.api.getListings({ listing_type_slug: 'marketplace' }).subscribe({
      next: (res) => {
        const days = (dateStr: string) => {
          const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
          return d === 0 ? 'Today' : d === 1 ? '1 day ago' : `${ d } days ago`;
        };
        this.mockItems = res.data.map((l: Listing, i: number) => ({
          id: l.id as any,
          title: l.title,
          price: l.listing_price ?? 0,
          image: l.images?.[0] ?? `gradient-${ (i % 6) + 1 }`,
          condition: l.metadata?.['condition'] ?? 'Used',
          seller: l.profiles?.full_name ?? 'Seller',
          postedDate: days(l.created_at),
          location: l.city,
          category: l.categories?.label ?? 'Other',
        }));
        this.filterItems();
      },
      error: () => {
        this.filterItems();
      },
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterItems();
  }

  filterItems() {
    let items = [...this.mockItems];

    // Filter by category
    if (this.selectedCategory !== 'All') {
      items = items.filter(item => item.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.seller.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    this.sortItems(items);
  }

  sortItems(items?: MarketplaceItem[]) {
    const itemsToSort = items || this.filteredItems;

    switch (this.sortBy) {
      case 'price-low':
        itemsToSort.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        itemsToSort.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        itemsToSort.sort((a, b) => {
          const dateA = this.getDateValue(a.postedDate);
          const dateB = this.getDateValue(b.postedDate);
          return dateB - dateA;
        });
    }

    this.filteredItems = itemsToSort;
  }

  private getDateValue(dateStr: string): number {
    if (dateStr.includes('day')) {
      return parseInt(dateStr) * 86400;
    } else if (dateStr.includes('week')) {
      return parseInt(dateStr) * 604800;
    }
    return 0;
  }

  getGradient(): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }
}
