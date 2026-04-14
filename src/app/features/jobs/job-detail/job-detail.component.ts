import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@core/services/api.service';
import { Listing } from '@core/models';

interface JobDetail {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDaysAgo: number;
  logoInitial: string;
  logoGradient: string;
  fullDescription: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  companyInfo: string;
  companySite?: string;
}

interface SimilarJob {
  id: string;
  title: string;
  company: string;
  type: string;
}

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  applicantEmail = signal('');
  resumeFile = signal<File | null>(null);
  job = signal<JobDetail | null>(null);
  similarJobs = signal<SimilarJob[]>([]);
  loading = signal(true);
  notFound = signal(false);

  private readonly gradients = [
    'linear-gradient(135deg, #B5261E, #D4822A)',
    'linear-gradient(135deg, #1A4FA0, #3B7DD8)',
    'linear-gradient(135deg, #1E7A50, #28A869)',
    'linear-gradient(135deg, #7A3B8C, #A855F7)',
    'linear-gradient(135deg, #D4822A, #F0A84E)',
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'] as string;
      this.loading.set(true);
      this.notFound.set(false);
      this.job.set(null);
      this.similarJobs.set([]);

      this.api.getListing(id).subscribe({
        next: (l: Listing) => {
          this.job.set(this.mapListing(l));
          this.loading.set(false);
          this.loadSimilarJobs(id);
        },
        error: () => {
          this.notFound.set(true);
          this.loading.set(false);
        },
      });
    });
  }

  private mapListing(l: Listing): JobDetail {
    const gradientIdx = l.title.charCodeAt(0) % this.gradients.length;
    const daysDiff = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);
    const meta = l.metadata ?? {};
    const salary = l.listing_price_label
      ? l.listing_price_label
      : l.listing_price != null
        ? `$${l.listing_price.toLocaleString()}`
        : 'Discuss';

    return {
      id: l.id,
      title: l.title,
      company: meta['company'] ?? l.profiles?.full_name ?? 'Unknown',
      location: l.city,
      type: meta['employment_type'] ?? l.categories?.label ?? 'Full-time',
      salary,
      postedDaysAgo: daysDiff,
      logoInitial: l.title.charAt(0).toUpperCase(),
      logoGradient: this.gradients[gradientIdx],
      fullDescription: l.description,
      requirements: Array.isArray(meta['requirements']) ? meta['requirements'] : [],
      responsibilities: Array.isArray(meta['responsibilities']) ? meta['responsibilities'] : [],
      benefits: Array.isArray(meta['benefits']) ? meta['benefits'] : [],
      companyInfo: meta['company_info'] ?? '',
      companySite: meta['company_site'] ?? undefined,
    };
  }

  private loadSimilarJobs(currentId: string): void {
    this.api.getListings({ listing_type_slug: 'jobs', limit: 4 }).subscribe({
      next: (res) => {
        const similar = res.data
          .filter(l => l.id !== currentId)
          .slice(0, 3)
          .map(l => ({
            id: l.id,
            title: l.title,
            company: l.metadata?.['company'] ?? l.profiles?.full_name ?? 'Unknown',
            type: l.metadata?.['employment_type'] ?? l.categories?.label ?? 'Full-time',
          }));
        this.similarJobs.set(similar);
      },
    });
  }

  onResumeUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.resumeFile.set(input.files[0]);
  }

  onSubmitApplication(): void {
    const email = this.applicantEmail();
    const file = this.resumeFile();
    const j = this.job();
    if (email && file && j) {
      alert(`Application submitted for "${j.title}"!\nWe'll review your application and contact you soon.`);
      this.applicantEmail.set('');
      this.resumeFile.set(null);
    }
  }

  scrollToApply(): void {
    document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}
