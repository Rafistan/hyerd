import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';

export interface HousingDetail {
  id: string;
  title: string;
  location: string;
  price: number | null;
  priceLabel: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  category: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  furnished: string;
  parking: string;
  petsAllowed: string;
  utilitiesIncluded: string;
  availableDate: string;
  tags: string[];
  listedDaysAgo: number;
}

@Component({
  selector: 'app-housing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './housing-detail.component.html',
  styleUrl: './housing-detail.component.scss',
})
export class HousingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  listing = signal<HousingDetail | null>(null);
  loading = signal(true);
  notFound = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id')!;
      this.loading.set(true);
      this.notFound.set(false);

      this.api.getListing(id).subscribe({
        next: (l: Listing) => {
          const meta = l.metadata ?? {};
          const daysDiff = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);
          this.listing.set({
            id: l.id,
            title: l.title,
            location: l.city,
            price: l.listing_price ?? null,
            priceLabel: l.listing_price_label ?? '/mo',
            bedrooms: meta['bedrooms'] ?? 0,
            bathrooms: meta['bathrooms'] ?? 0,
            sqft: meta['sqft'] ?? 0,
            category: l.categories?.label ?? 'Rental',
            description: l.description,
            contactName: l.profiles?.full_name ?? 'Landlord',
            contactPhone: l.contact_phone,
            contactEmail: l.contact_email,
            furnished: meta['furnished'] ?? '',
            parking: meta['parking'] ?? '',
            petsAllowed: meta['pets_allowed'] ?? '',
            utilitiesIncluded: meta['utilities_included'] ?? '',
            availableDate: meta['available_date'] ?? '',
            tags: l.tags ?? [],
            listedDaysAgo: daysDiff,
          });
          this.loading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  formatPrice(price: number | null, label: string): string {
    if (!price) return 'Contact for price';
    return '$' + price.toLocaleString() + (label ? ' ' + label : '');
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
