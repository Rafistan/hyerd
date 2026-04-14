import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';

export interface EventDetail {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  location: string;
  category: string;
  price: number | null;
  priceLabel: string;
  description: string;
  capacity: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  tags: string[];
  postedDaysAgo: number;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  event = signal<EventDetail | null>(null);
  loading = signal(true);
  notFound = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'] as string;
      this.loading.set(true);
      this.notFound.set(false);

      this.api.getListing(id).subscribe({
        next: (l: Listing) => {
          const meta = l.metadata ?? {};
          const daysDiff = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);
          this.event.set({
            id: l.id,
            title: l.title,
            date: meta['date'] ?? '',
            time: meta['time'] ?? '',
            venue: meta['venue'] ?? '',
            address: meta['address'] ?? '',
            location: l.city,
            category: l.categories?.label ?? 'Event',
            price: l.listing_price ?? null,
            priceLabel: l.listing_price_label ?? '',
            description: l.description,
            capacity: meta['attendees_max'] ?? 0,
            contactName: l.profiles?.full_name ?? 'Organizer',
            contactPhone: l.contact_phone,
            contactEmail: l.contact_email,
            tags: l.tags ?? [],
            postedDaysAgo: daysDiff,
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
