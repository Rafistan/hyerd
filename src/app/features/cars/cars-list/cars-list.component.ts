import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';

interface Car {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  condition: string;
  location: string;
  features: string[];
  sellerName: string;
  gradient: string;
}

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './cars-list.component.html',
  styleUrl: './cars-list.component.scss',
})
export class CarsListComponent implements OnInit {
  filters = {
    keyword: '',
    location: '',
    make: '',
    model: '',
    yearMin: '' as string | number,
    yearMax: '' as string | number,
    priceMin: '' as string | number,
    priceMax: '' as string | number,
    condition: '',
  };

  readonly yearRange: number[] = Array.from(
    { length: new Date().getFullYear() - 2009 },
    (_, i) => new Date().getFullYear() - i
  );

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  error = signal('');
  private cars: Car[] = [];
  filteredCars = signal<Car[]>([]);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['q']) this.filters.keyword = params['q'];
    if (params['location']) this.filters.location = params['location'];
    this.loading.set(true);
    this.api.getListings({ listing_type_slug: 'cars' }).subscribe({
      next: (res) => {
        this.cars = res.data.map(l => this.mapListing(l));
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load car listings.');
        this.loading.set(false);
      },
    });
  }

  private mapListing(l: Listing): Car {
    const gradients = [
      'linear-gradient(135deg, #1E1531 0%, #3D1F40 100%)',
      'linear-gradient(135deg, #1A4FA0 0%, #3B7DD8 100%)',
      'linear-gradient(135deg, #1E7A50 0%, #28A869 100%)',
      'linear-gradient(135deg, #B5261E 0%, #D4822A 100%)',
      'linear-gradient(135deg, #D4822A 0%, #F0A84E 100%)',
    ];
    return {
      id: l.id,
      year: l.metadata?.['year'] ?? new Date().getFullYear(),
      make: l.metadata?.['make'] ?? l.title.split(' ')[0] ?? 'Unknown',
      model: l.metadata?.['model'] ?? l.title.split(' ').slice(1).join(' ') ?? '',
      price: l.listing_price ?? 0,
      mileage: l.metadata?.['mileage'] ?? 0,
      condition: l.metadata?.['condition'] ?? 'Used',
      location: l.city,
      features: l.tags?.length ? l.tags : [],
      sellerName: l.profiles?.full_name ?? 'Seller',
      gradient: gradients[l.title.charCodeAt(0) % gradients.length],
    };
  }

  applyFilters(): void {
    this.filteredCars.set(
      this.cars.filter(car => {
        const kw = this.filters.keyword.toLowerCase();
        const kwOk = !kw || car.make.toLowerCase().includes(kw) || car.model.toLowerCase().includes(kw) || String(car.year).includes(kw);
        const locOk = !this.filters.location || car.location.toLowerCase().includes(this.filters.location.toLowerCase());
        const makeOk = !this.filters.make || car.make.toLowerCase().includes(this.filters.make.toLowerCase());
        const modelOk = !this.filters.model || car.model.toLowerCase().includes(this.filters.model.toLowerCase());
        const yearMinOk = !this.filters.yearMin || car.year >= +this.filters.yearMin;
        const yearMaxOk = !this.filters.yearMax || car.year <= +this.filters.yearMax;
        const priceMinOk = !this.filters.priceMin || car.price >= +this.filters.priceMin;
        const priceMaxOk = !this.filters.priceMax || car.price <= +this.filters.priceMax;
        const condOk = !this.filters.condition || car.condition === this.filters.condition;
        return kwOk && locOk && makeOk && modelOk && yearMinOk && yearMaxOk && priceMinOk && priceMaxOk && condOk;
      })
    );
  }

  resetFilters(): void {
    this.filters = { keyword: '', location: '', make: '', model: '', yearMin: '', yearMax: '', priceMin: '', priceMax: '', condition: '' };
    this.filteredCars.set(this.cars);
  }

  formatPrice(price: number): string {
    return '$' + price.toLocaleString();
  }

  formatMileage(mileage: number): string {
    return mileage.toLocaleString();
  }
}
