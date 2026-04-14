import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  postedDaysAgo: number;
  description: string;
  tags: string[];
  logoInitial: string;
  logoGradient: string;
}

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './jobs-list.component.html',
  styleUrl: 'jobs-list.component.scss',
})
export class JobsListComponent implements OnInit, OnDestroy {
  // Signal-backed so filteredJobs computed() reacts to changes
  private _searchKeyword = signal('');
  private _searchLocation = signal('');
  private _selectedJobType = signal('');

  get searchKeyword() { return this._searchKeyword(); }
  set searchKeyword(v: string) {
    this._searchKeyword.set(v);
    this.searchSubject.next();
  }

  get searchLocation() { return this._searchLocation(); }
  set searchLocation(v: string) {
    this._searchLocation.set(v);
    this.searchSubject.next();
  }

  get selectedJobType() { return this._selectedJobType(); }
  set selectedJobType(v: string) { this._selectedJobType.set(v); }

  selectedFilter = signal('All');
  currentPage = signal(1);
  readonly itemsPerPage = 6;

  filterTags = ['All', 'Tech', 'Legal', 'Medical', 'Finance', 'Marketing', 'Education', 'Other'];

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private searchSubject = new Subject<void>();
  private subs = new Subscription();

  loading = signal(false);
  error = signal('');
  jobs = signal<Job[]>([]);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['q']) this._searchKeyword.set(params['q']);
    if (params['location']) this._searchLocation.set(params['location']);
    this.fetchJobs();
    this.subs.add(
      this.searchSubject.pipe(debounceTime(350)).subscribe(() => {
        this.currentPage.set(1);
        this.fetchJobs();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private fetchJobs(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getListings({
      listing_type_slug: 'jobs',
      search: this._searchKeyword() || undefined,
      city: this._searchLocation() || undefined,
      limit: 50,
    }).subscribe({
      next: (res) => {
        this.jobs.set(res.data.map(l => this.mapListing(l)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load job listings.');
        this.loading.set(false);
      },
    });
  }

  private mapListing(l: Listing): Job {
    const gradients = [
      'linear-gradient(135deg, #B5261E, #D4822A)',
      'linear-gradient(135deg, #1A4FA0, #3B7DD8)',
      'linear-gradient(135deg, #1E7A50, #28A869)',
      'linear-gradient(135deg, #7A3B8C, #A855F7)',
      'linear-gradient(135deg, #D4822A, #F0A84E)',
    ];
    const gradientIdx = l.title.charCodeAt(0) % gradients.length;
    const createdAt = new Date(l.created_at);
    const daysDiff = Math.floor((Date.now() - createdAt.getTime()) / 86400000);
    return {
      id: l.id as any,
      title: l.title,
      company: l.profiles?.full_name ?? l.metadata?.['company'] ?? 'Unknown',
      location: l.city,
      type: (l.metadata?.['employment_type'] ?? l.categories?.label ?? 'Full-time') as any,
      salary: l.listing_price
        ? `$${l.listing_price.toLocaleString()}${l.listing_price_label ? ' ' + l.listing_price_label : ''}`
        : 'Discuss',
      postedDaysAgo: daysDiff,
      description: l.description,
      tags: l.tags?.length ? l.tags : [l.categories?.label ?? 'Other'],
      logoInitial: l.title.charAt(0).toUpperCase(),
      logoGradient: gradients[gradientIdx],
    };
  }

  filteredJobs = computed(() => {
    const kw = this._searchKeyword().toLowerCase();
    const loc = this._searchLocation().toLowerCase();
    const type = this._selectedJobType();
    const filter = this.selectedFilter();

    return this.jobs().filter(job => {
      const matchesKw = !kw || job.title.toLowerCase().includes(kw) || job.company.toLowerCase().includes(kw);
      const matchesLoc = !loc || job.location.toLowerCase().includes(loc);
      const matchesType = !type || job.type === type;
      const matchesFilter = filter === 'All' || job.tags.includes(filter);
      return matchesKw && matchesLoc && matchesType && matchesFilter;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredJobs().length / this.itemsPerPage));

  paginatedJobs = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredJobs().slice(start, start + this.itemsPerPage);
  });

  onFilterChange(): void {
    this.currentPage.set(1); // Used by type/tag selects — no re-fetch needed (client-side)
  }

  setFilter(tag: string): void {
    this.selectedFilter.set(tag);
    this.currentPage.set(1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }
}
