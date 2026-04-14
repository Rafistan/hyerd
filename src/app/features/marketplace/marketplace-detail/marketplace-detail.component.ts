import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';

export interface MarketplaceItem {
  id: string;
  title: string;
  price: number | null;
  priceLabel: string;
  condition: string;
  brand: string;
  category: string;
  location: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  tags: string[];
  postedDaysAgo: number;
  gradient: string;
}

@Component({
  selector: 'app-marketplace-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './marketplace-detail.component.html',
  styleUrl: './marketplace-detail.component.scss',
})
export class MarketplaceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  item = signal<MarketplaceItem | null>(null);
  loading = signal(true);
  notFound = signal(false);

  private readonly gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'] as string;
      this.loading.set(true);
      this.notFound.set(false);

      this.api.getListing(id).subscribe({
        next: (l: Listing) => {
          const meta = l.metadata ?? {};
          const daysDiff = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);
          const hash = l.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
          this.item.set({
            id: l.id,
            title: l.title,
            price: l.listing_price ?? null,
            priceLabel: l.listing_price_label ?? '',
            condition: meta['condition'] ?? '',
            brand: meta['brand'] ?? '',
            category: l.categories?.label ?? 'Item',
            location: l.city,
            description: l.description,
            contactName: l.profiles?.full_name ?? 'Seller',
            contactPhone: l.contact_phone,
            contactEmail: l.contact_email,
            tags: l.tags ?? [],
            postedDaysAgo: daysDiff,
            gradient: this.gradients[hash % this.gradients.length],
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

  formatPrice(price: number | null): string {
    if (!price) return 'Free';
    return '$' + price.toLocaleString();
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
