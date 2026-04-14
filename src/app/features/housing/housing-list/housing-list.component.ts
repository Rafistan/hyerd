import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

interface Housing {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: 'Apartment' | 'House' | 'Condo' | 'Room';
  description: string;
  amenities: string[];
  postedDate: string;
  image: string;
}

@Component({
  selector: 'app-housing-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './housing-list.component.html',
  styleUrl: './housing-list.component.scss'
})
export class HousingListComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  listings: Housing[] = [];

  filteredListings: Housing[] = [];

  filters = {
    keyword: '',
    location: '',
    type: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    bedrooms: ''
  };

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params['q']) this.filters.keyword = params['q'];
    if (params['location']) this.filters.location = params['location'];
    this.api.getListings({ listing_type_slug: 'housing' }).subscribe({
      next: (res) => {
        this.listings = res.data.map(l => ({
          id: l.id as any,
          title: l.title,
          location: l.city,
          price: l.listing_price ?? 0,
          bedrooms: l.metadata?.['bedrooms'] ?? 0,
          bathrooms: l.metadata?.['bathrooms'] ?? 1,
          sqft: l.metadata?.['sqft'] ?? 0,
          type: l.categories?.label ?? l.metadata?.['type'] ?? 'Apartment',
          description: l.description,
          amenities: l.tags ?? [],
          postedDate: this.formatPostedDate(l.created_at),
          image: l.images?.[0] ?? '',
        }));
        this.applyFilters();
      },
      error: () => {
        this.filteredListings = [];
      },
    });
  }

  private formatPostedDate(dateStr: string): string {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${ days } days ago`;
    return `${ Math.floor(days / 7) } week${ Math.floor(days / 7) > 1 ? 's' : '' } ago`;
  }

  resetFilters() {
    this.filters = { keyword: '', location: '', type: '', minPrice: null, maxPrice: null, bedrooms: '' };
    this.filteredListings = this.listings;
  }

  applyFilters() {
    this.filteredListings = this.listings.filter(listing => {
      const kwMatch = !this.filters.keyword ||
        listing.title.toLowerCase().includes(this.filters.keyword.toLowerCase()) ||
        listing.description.toLowerCase().includes(this.filters.keyword.toLowerCase());

      const locationMatch = !this.filters.location ||
        listing.location.toLowerCase().includes(this.filters.location.toLowerCase()) ||
        listing.title.toLowerCase().includes(this.filters.location.toLowerCase());

      const typeMatch = !this.filters.type || listing.type === this.filters.type;

      const minPriceMatch = !this.filters.minPrice || listing.price >= this.filters.minPrice;

      const maxPriceMatch = !this.filters.maxPrice || listing.price <= this.filters.maxPrice;

      const bedroomMatch = !this.filters.bedrooms || listing.bedrooms >= parseInt(this.filters.bedrooms);

      return kwMatch && locationMatch && typeMatch && minPriceMatch && maxPriceMatch && bedroomMatch;
    });
  }

  getGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    return gradients[id % gradients.length];
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '$0';
    return '$' + price.toLocaleString();
  }
}
