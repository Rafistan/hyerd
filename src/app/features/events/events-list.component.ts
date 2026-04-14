import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Listing } from '../../core/models';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Event {
  id: number;
  title: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  price: number | null;
  attendees: number;
  image: string;
}

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="events-container">
      <!-- Header -->
      <div class="header">
        <h1>Community Events</h1>
        <p class="subtitle">Discover and join Armenian community gatherings</p>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div class="view-toggle">
          <button
            class="toggle-btn"
            [class.active]="currentView === 'grid'"
            (click)="currentView = 'grid'"
          >
            <span class="icon">⊞</span> Grid View
          </button>
          <button
            class="toggle-btn"
            [class.active]="currentView === 'calendar'"
            (click)="currentView = 'calendar'"
          >
            <span class="icon">📅</span> Calendar View
          </button>
        </div>
      </div>

      <!-- Filter Tags -->
      <div class="filter-tags">
        <button
          *ngFor="let filter of filters"
          class="filter-tag"
          [class.active]="selectedFilter === filter"
          (click)="selectedFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <!-- Events Grid -->
      <div class="events-grid" *ngIf="currentView === 'grid'">
        <div *ngFor="let event of filteredEvents" class="event-card" [routerLink]="['/events', event.id]">
          <div class="card-image" [style.backgroundImage]="'url(' + event.image + ')'">
            <div class="date-badge">
              <div class="month">{{ event.date | date: 'MMM' }}</div>
              <div class="day">{{ event.date | date: 'd' }}</div>
            </div>
            <span class="category-badge">{{ event.category }}</span>
          </div>
          <div class="card-content">
            <h3>{{ event.title }}</h3>
            <div class="event-meta">
              <div class="time-info">
                <span class="icon">🕐</span>
                <span>{{ event.time }}</span>
              </div>
              <div class="location-info">
                <span class="icon">📍</span>
                <span>{{ event.location }}</span>
              </div>
            </div>
            <div class="event-footer">
              <div class="price">
                {{ event.price ? '$' + event.price : 'Free' }}
              </div>
              <div class="attendees">
                <span class="icon">👥</span>
                <span>{{ event.attendees }} attending</span>
              </div>
            </div>
            <button class="cta-button" (click)="handleTickets($event, event.id)">
              {{ event.price ? 'Get Tickets' : 'RSVP' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar View Placeholder -->
      <div class="calendar-view" *ngIf="currentView === 'calendar'">
        <div class="placeholder">
          <p>📅 Calendar view coming soon</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --hy-primary: #e74c3c;
      --hy-secondary: #3498db;
      --hy-accent: #f39c12;
      --hy-text: #2c3e50;
      --hy-text-light: #7f8c8d;
      --hy-border: #ecf0f1;
      --hy-bg: #f8f9fa;
      --hy-card-bg: #ffffff;
      --hy-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      --hy-shadow-hover: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .events-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header h1 {
      font-size: 2.5rem;
      color: var(--hy-primary);
      margin: 0;
      font-weight: 700;
    }

    .subtitle {
      color: var(--hy-text-light);
      font-size: 1.1rem;
      margin-top: 0.5rem;
    }

    .controls {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
      background: var(--hy-border);
      padding: 0.5rem;
      border-radius: 8px;
    }

    .toggle-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 6px;
      font-weight: 500;
      color: var(--hy-text-light);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toggle-btn.active {
      background: var(--hy-card-bg);
      color: var(--hy-primary);
      box-shadow: var(--hy-shadow);
    }

    .toggle-btn:hover {
      color: var(--hy-primary);
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2rem;
      justify-content: center;
    }

    .filter-tag {
      padding: 0.6rem 1.2rem;
      border: 2px solid var(--hy-border);
      background: var(--hy-card-bg);
      border-radius: 25px;
      cursor: pointer;
      color: var(--hy-text);
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .filter-tag:hover {
      border-color: var(--hy-secondary);
      color: var(--hy-secondary);
    }

    .filter-tag.active {
      background: var(--hy-primary);
      border-color: var(--hy-primary);
      color: white;
    }

    .events-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .event-card {
      background: var(--hy-card-bg);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--hy-shadow);
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .event-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--hy-shadow-hover);
    }

    .card-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
    }

    .card-image::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.3) 0%, rgba(52, 152, 219, 0.3) 100%);
    }

    .date-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--hy-primary);
      color: white;
      border-radius: 8px;
      padding: 0.5rem;
      text-align: center;
      font-weight: 700;
      min-width: 50px;
    }

    .date-badge .month {
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .date-badge .day {
      font-size: 1.2rem;
    }

    .category-badge {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: var(--hy-secondary);
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .card-content h3 {
      margin: 0 0 1rem 0;
      color: var(--hy-text);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .event-meta {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .time-info,
    .location-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--hy-text-light);
      font-size: 0.95rem;
    }

    .icon {
      font-size: 1rem;
    }

    .event-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--hy-border);
    }

    .price {
      font-weight: 700;
      color: var(--hy-primary);
      font-size: 1.1rem;
    }

    .attendees {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--hy-text-light);
      font-size: 0.9rem;
    }

    .cta-button {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, var(--hy-primary) 0%, var(--hy-accent) 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
    }

    .cta-button:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
    }

    .calendar-view {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .placeholder {
      text-align: center;
      padding: 2rem;
      color: var(--hy-text-light);
      font-size: 1.25rem;
    }

    @media (max-width: 768px) {
      .events-container {
        padding: 1rem;
      }

      .header h1 {
        font-size: 1.75rem;
      }

      .events-grid {
        grid-template-columns: 1fr;
      }

      .view-toggle {
        flex-direction: column;
      }

      .toggle-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class EventsListComponent implements OnInit {
  currentView: 'grid' | 'calendar' = 'grid';
  selectedFilter = 'All';
  searchQuery = '';
  locationFilter = '';

  filters = ['All', 'Cultural', 'Music', 'Food', 'Networking', 'Sports', 'Education', 'Religious'];

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  events: Event[] = [];
  loading = false;
  error = '';

  get filteredEvents(): Event[] {
    const kw = this.searchQuery.toLowerCase();
    const loc = this.locationFilter.toLowerCase();
    return this.events.filter(event => {
      const matchesFilter = this.selectedFilter === 'All' || event.category === this.selectedFilter;
      const matchesKw = !kw || event.title.toLowerCase().includes(kw);
      const matchesLoc = !loc || event.location.toLowerCase().includes(loc);
      return matchesFilter && matchesKw && matchesLoc;
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['q']) this.searchQuery = params['q'];
    if (params['location']) this.locationFilter = params['location'];
    this.loading = true;
    this.api.getListings({ listing_type_slug: 'events' }).subscribe({
      next: (res) => {
        this.events = res.data.map(l => ({
          id: l.id as any,
          title: l.title,
          date: new Date(l.metadata?.['date'] ?? l.created_at),
          time: l.metadata?.['time'] ?? '',
          location: l.city,
          category: l.categories?.label ?? l.metadata?.['category'] ?? 'Cultural',
          price: l.listing_price ?? null,
          attendees: l.metadata?.['attendees'] ?? null,
          image: l.images?.[0] ?? '',
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load events.';
        this.loading = false;
      },
    });
  }

  handleTickets(event: MouseEvent, eventId: number): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Ticket action for event:', eventId);
  }
}
