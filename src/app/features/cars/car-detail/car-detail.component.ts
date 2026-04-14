import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Listing } from '../../../core/models';

interface CarDetail {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  condition: string;
  transmission: string;
  fuel: string;
  color: string;
  location: string;
  description: string;
  features: string[];
  sellerName: string;
  sellerPhone: string;
  viewCount: number;
  listedDaysAgo: number;
}

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './car-detail.component.html',
  styleUrl: './car-detail.component.scss',
})
export class CarDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  loading = signal(true);
  notFound = signal(false);
  car = signal<CarDetail | null>(null);

  readonly safetyTips = [
    'Meet in a safe, public location',
    'Inspect before you purchase',
    'Request full service history',
    'Check vehicle history report',
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'] as string;
      this.loading.set(true);
      this.notFound.set(false);
      this.car.set(null);

      this.api.getListing(id).subscribe({
        next: (l: Listing) => {
          this.car.set(this.mapListing(l));
          this.loading.set(false);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  private mapListing(l: Listing): CarDetail {
    const meta = l.metadata ?? {};
    const daysDiff = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);

    return {
      id: l.id,
      year: meta['year'] ?? new Date().getFullYear(),
      make: meta['make'] ?? l.title.split(' ')[0] ?? 'Unknown',
      model: meta['model'] ?? l.title.split(' ').slice(1).join(' ') ?? '',
      price: l.listing_price ?? 0,
      mileage: meta['mileage'] ?? 0,
      condition: meta['condition'] ?? 'Used',
      transmission: meta['transmission'] ?? '—',
      fuel: meta['fuel'] ?? '—',
      color: meta['color'] ?? '—',
      location: l.city,
      description: l.description,
      features: Array.isArray(meta['features']) ? meta['features'] : (l.tags ?? []),
      sellerName: l.profiles?.full_name ?? 'Seller',
      sellerPhone: l.contact_phone ?? '—',
      viewCount: l.view_count ?? 0,
      listedDaysAgo: daysDiff,
    };
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  formatPrice(price: number): string {
    return '$' + price.toLocaleString();
  }

  getSpecs(c: CarDetail): { label: string; value: string; icon: string }[] {
    return [
      { label: 'Year',         value: String(c.year),                   icon: 'bi-calendar3' },
      { label: 'Mileage',      value: c.mileage.toLocaleString() + ' mi', icon: 'bi-speedometer2' },
      { label: 'Transmission', value: c.transmission,                   icon: 'bi-gear' },
      { label: 'Fuel Type',    value: c.fuel,                           icon: 'bi-lightning-charge' },
      { label: 'Color',        value: c.color,                          icon: 'bi-palette' },
      { label: 'Condition',    value: c.condition,                      icon: 'bi-award' },
    ];
  }
}
