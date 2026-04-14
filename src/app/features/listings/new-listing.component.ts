import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Category, ListingType } from '../../core/models';

// Type-specific metadata field definitions
const METADATA_FIELDS: Record<string, {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string
}[]> = {
  businesses: [
    { key: 'address', label: 'Street Address', type: 'text', placeholder: '123 Main St, Glendale, CA 91205' },
    { key: 'website', label: 'Website (optional)', type: 'text', placeholder: 'www.yourbusiness.com' },
    { key: 'hours_monday', label: 'Monday Hours', type: 'text', placeholder: '9:00 AM – 5:00 PM or Closed' },
    { key: 'hours_tuesday', label: 'Tuesday Hours', type: 'text', placeholder: '9:00 AM – 5:00 PM or Closed' },
    { key: 'hours_wednesday', label: 'Wednesday Hours', type: 'text', placeholder: '9:00 AM – 5:00 PM or Closed' },
    { key: 'hours_thursday', label: 'Thursday Hours', type: 'text', placeholder: '9:00 AM – 5:00 PM or Closed' },
    { key: 'hours_friday', label: 'Friday Hours', type: 'text', placeholder: '9:00 AM – 5:00 PM or Closed' },
    { key: 'hours_saturday', label: 'Saturday Hours', type: 'text', placeholder: 'By Appointment or Closed' },
    { key: 'hours_sunday', label: 'Sunday Hours', type: 'text', placeholder: 'Closed' },
  ],
  jobs: [
    { key: 'company', label: 'Company / Employer', type: 'text', required: true },
    { key: 'employment_type', label: 'Employment Type', type: 'select' },
    { key: 'salary_range', label: 'Salary Range', type: 'text' },
  ],
  housing: [
    { key: 'bedrooms', label: 'Bedrooms', type: 'number', placeholder: '2' },
    { key: 'bathrooms', label: 'Bathrooms', type: 'number', placeholder: '1' },
    { key: 'sqft', label: 'Square Footage', type: 'number', placeholder: '900' },
    { key: 'furnished', label: 'Furnished', type: 'select' },
    { key: 'parking', label: 'Parking', type: 'select' },
    { key: 'pets_allowed', label: 'Pets Allowed', type: 'select' },
    { key: 'utilities_included', label: 'Utilities Included', type: 'select' },
    { key: 'available_date', label: 'Available From', type: 'date' },
  ],
  cars: [
    { key: 'make', label: 'Make (e.g. Toyota)', type: 'text', required: true, placeholder: 'Toyota' },
    { key: 'model', label: 'Model', type: 'text', required: true, placeholder: 'Camry' },
    { key: 'year', label: 'Year', type: 'number', required: true, placeholder: '2020' },
    { key: 'mileage', label: 'Mileage', type: 'number', placeholder: '45000' },
    { key: 'condition', label: 'Condition', type: 'select' },
    { key: 'transmission', label: 'Transmission', type: 'select' },
    { key: 'fuel', label: 'Fuel Type', type: 'select' },
    { key: 'color', label: 'Exterior Color', type: 'text', placeholder: 'Silver' },
  ],
  events: [
    { key: 'date', label: 'Event Date', type: 'date', required: true },
    { key: 'time', label: 'Start Time', type: 'text', placeholder: '7:00 PM' },
    { key: 'venue', label: 'Venue Name', type: 'text', placeholder: 'Glendale Civic Auditorium' },
    { key: 'address', label: 'Venue Address', type: 'text', placeholder: '1401 N Verdugo Rd, Glendale, CA' },
    { key: 'attendees_max', label: 'Max Capacity (optional)', type: 'number' },
  ],
  marketplace: [
    { key: 'condition', label: 'Condition', type: 'select', required: true },
    { key: 'brand', label: 'Brand / Manufacturer', type: 'text', placeholder: 'Apple, IKEA, Sony…' },
  ],
};

const HOURS_KEYS: Record<string, string> = {
  hours_monday: 'Monday', hours_tuesday: 'Tuesday', hours_wednesday: 'Wednesday',
  hours_thursday: 'Thursday', hours_friday: 'Friday', hours_saturday: 'Saturday',
  hours_sunday: 'Sunday',
};

@Component({
  selector: 'app-new-listing',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './new-listing.component.html',
  styleUrl: './new-listing.component.scss',
})
export class NewListingComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly totalSteps = 4;
  currentStep = signal(1);
  loading = signal(false);
  submitError = signal('');
  loadingTypes = signal(true);

  listingTypes = signal<ListingType[]>([]);
  categories = signal<Category[]>([]);
  selectedType = signal<ListingType | null>(null);

  steps = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Contact' },
    { num: 4, label: 'Extras' },
  ];

  metaFields = computed(() => {
    const slug = this.selectedType()?.slug;
    return slug ? (METADATA_FIELDS[slug] ?? []) : [];
  });

  hoursFields = computed(() =>
    this.metaFields().filter(f => f.key.startsWith('hours_'))
  );

  form = this.fb.group({
    listing_type_id: ['', Validators.required],
    category_id: [''],
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    city: ['', Validators.required],
    contact_email: ['', [Validators.required, Validators.email]],
    contact_phone: ['', Validators.required],
    listing_price: [null as number | null],
    listing_price_label: [''],
    tags_input: [''],
    // Dynamic meta fields are added in ngOnInit/selectListingType
  });

  ngOnInit(): void {
    // Redirect to login if not authenticated
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.api.getListingTypes().subscribe({
      next: (types) => {
        this.listingTypes.set(types);
        this.loadingTypes.set(false);
      },
      error: () => this.loadingTypes.set(false),
    });
  }

  selectListingType(lt: ListingType): void {
    this.selectedType.set(lt);
    this.form.patchValue({ listing_type_id: lt.id, category_id: '' });

    // Load categories for this type
    this.api.getCategories(lt.slug).subscribe({
      next: (cats) => this.categories.set(cats),
    });

    // Add meta controls for this listing type
    const fields = METADATA_FIELDS[lt.slug] ?? [];
    fields.forEach(f => {
      const key = 'meta_' + f.key;
      if (!this.form.contains(key)) {
        (this.form as unknown as FormGroup<{ [key: string]: AbstractControl }>).addControl(key, this.fb.control(''));
      }
    });
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      this.form.get('listing_type_id')?.markAsTouched();
      if (!this.form.value.listing_type_id) return;
    }

    if (this.currentStep() === 2) {
      ['title', 'description', 'city'].forEach(f => this.form.get(f)?.markAsTouched());
      if (this.form.get('title')?.invalid || this.form.get('description')?.invalid || this.form.get('city')?.invalid) return;
    }

    if (this.currentStep() === 3) {
      ['contact_email', 'contact_phone'].forEach(f => this.form.get(f)?.markAsTouched());
      if (this.form.get('contact_email')?.invalid || this.form.get('contact_phone')?.invalid) return;
    }

    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  showError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.submitError.set('');

    const v = this.form.value;

    // Build metadata from meta_ prefixed controls
    const metadata: Record<string, any> = {};
    this.metaFields().forEach(f => {
      const val = (this.form.get('meta_' + f.key) as any)?.value;
      if (val !== '' && val !== null && val !== undefined) {
        metadata[f.key] = val;
      }
    });

    // For businesses, collapse hours_* keys into a nested hours object
    if (this.selectedType()?.slug === 'businesses') {
      const hours: Record<string, string> = {};
      for (const key of Object.keys(HOURS_KEYS)) {
        if (metadata[key]) {
          hours[HOURS_KEYS[key]] = metadata[key];
          delete metadata[key];
        }
      }
      if (Object.keys(hours).length > 0) {
        metadata['hours'] = hours;
      }
    }

    const tags = v.tags_input
      ? v.tags_input.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      listing_type_id: v.listing_type_id!,
      category_id: v.category_id || undefined,
      title: v.title!,
      description: v.description!,
      city: v.city!,
      contact_email: v.contact_email!,
      contact_phone: v.contact_phone!,
      listing_price: v.listing_price ?? undefined,
      listing_price_label: v.listing_price_label || undefined,
      metadata,
      tags,
    };

    this.api.createListing(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.submitError.set(err?.error?.message ?? 'Failed to publish listing. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
