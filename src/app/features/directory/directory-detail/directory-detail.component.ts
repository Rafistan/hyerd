import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';

interface BusinessDetail {
  id: string;
  name: string;
  category: string;
  rating: number;
  verified: boolean;
  address: string;
  phone: string;
  email: string;
  website: string;
  hoursOfOperation: { [key: string]: string };
  description: string;
}

@Component({
  selector: 'app-directory-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './directory-detail.component.html',
  styleUrl: './directory-detail.component.scss',
})
export class DirectoryDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  business = signal<BusinessDetail | null>(null);
  loading = signal(true);
  error = signal('');
  hoursArray: Array<{ day: string; hours: string }> = [];
  Math = Math;
  todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loading.set(true);
      this.error.set('');
      this.api.getListing(params['id']).subscribe({
        next: (l: Listing) => {
          const hours: { [key: string]: string } = l.metadata?.['hours'] ?? {};
          this.hoursArray = Object.keys(hours).map(day => ({ day, hours: hours[day] }));
          this.business.set({
            id: l.id,
            name: l.title,
            category: l.categories?.label ?? l.metadata?.['category'] ?? '',
            rating: l.metadata?.['rating'] ?? 0,
            verified: l.metadata?.['verified'] ?? false,
            address: l.metadata?.['address'] ?? l.city,
            phone: l.contact_phone,
            email: l.contact_email,
            website: l.metadata?.['website'] ?? '',
            hoursOfOperation: hours,
            description: l.description,
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Business not found.');
          this.loading.set(false);
        },
      });
    });
  }

  getGradient(id: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    ];
    const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }
}
