import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Listing as ApiListing } from '../../core/models';

interface ProfileListing {
  id: string;
  title: string;
  category: string;
  price: string;
  gradient: string;
  categoryColor: string;
}

interface ProfileReview {
  id: string;
  author: string;
  authorInitials: string;
  avatarColor: string;
  rating: number;
  content: string;
  date: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="profile-page">

      <!-- Cover Banner -->
      <div class="profile-cover">
        <div class="cover-pattern" aria-hidden="true"></div>
        <div class="cover-overlay"></div>
        <!-- Armenian tricolor stripe -->
        <div class="cover-stripe"></div>
      </div>

      @if (loading) {
        <div style="text-align:center;padding:80px 24px;color:var(--hy-text-muted)">
          <i class="bi bi-arrow-repeat" style="font-size:2rem;display:block;margin-bottom:12px;animation:spin 1s linear infinite"></i>
          Loading profile...
        </div>
      } @else if (error) {
        <div style="text-align:center;padding:80px 24px;color:var(--hy-text-muted)">
          <i class="bi bi-person-x" style="font-size:2.5rem;display:block;margin-bottom:12px"></i>
          <p style="margin:0">{{ error }}</p>
        </div>
      } @else {

      <div class="profile-container">

        <!-- Profile Header Card -->
        <div class="profile-header-card">
          <div class="avatar-section">
            <div class="avatar-xl">
              {{ profile.name ? profile.name.charAt(0) : '?' }}
              <div class="avatar-online"></div>
            </div>
          </div>

          <div class="profile-info">
            <div class="profile-name-row">
              <h1 class="profile-name">{{ profile.name }}</h1>
              <div class="verified-pill">
                <i class="bi bi-patch-check-fill"></i> Verified Member
              </div>
            </div>

            <div class="profile-meta-row">
              <span class="meta-item">
                <i class="bi bi-geo-alt"></i> {{ profile.location }}
              </span>
              <span class="meta-sep">·</span>
              <span class="meta-item">
                <i class="bi bi-calendar3"></i> Member since {{ profile.memberSince }}
              </span>
              <span class="meta-sep">·</span>
              <span class="meta-item rating-item">
                <i class="bi bi-star-fill" style="color:#D4822A"></i>
                <strong>{{ profile.rating }}</strong>
                <span>({{ profile.reviewsCount }} reviews)</span>
              </span>
            </div>

            <p class="profile-bio">{{ profile.bio }}</p>
          </div>

          <div class="profile-actions">
            <button class="btn-hy btn-hy-primary">
              <i class="bi bi-chat-dots"></i> Message
            </button>
            <button class="btn-hy btn-hy-outline">
              <i class="bi bi-person-plus"></i> Follow
            </button>
            <button class="btn-hy btn-hy-ghost btn-hy-icon" title="Share profile">
              <i class="bi bi-share"></i>
            </button>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="profile-stats-row">
          <div class="profile-stat">
            <span class="ps-val">{{ profile.listingsCount }}</span>
            <span class="ps-lbl">Listings</span>
          </div>
          <div class="ps-divider"></div>
          <div class="profile-stat">
            <span class="ps-val">{{ profile.reviewsCount }}</span>
            <span class="ps-lbl">Reviews</span>
          </div>
          <div class="ps-divider"></div>
          <div class="profile-stat">
            <span class="ps-val">{{ profile.rating }}</span>
            <span class="ps-lbl">Rating</span>
          </div>
          <div class="ps-divider"></div>
          <div class="profile-stat">
            <span class="ps-val">{{ profile.responseRate }}</span>
            <span class="ps-lbl">Response Rate</span>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-nav">
          @for (tab of tabs; track tab) {
            <button
              class="tab-btn"
              [class.active]="activeTab() === tab"
              (click)="activeTab.set(tab)"
            >{{ tab }}</button>
          }
        </div>

        <!-- Tab Content -->
        <div class="tab-content">

          <!-- Listings Tab -->
          @if (activeTab() === 'Listings') {
            @if (profile.listings.length > 0) {
              <div class="listings-grid">
                @for (item of profile.listings; track item.id) {
                  <a [routerLink]="['/marketplace', item.id]" class="profile-listing-card">
                    <div class="plc-image" [style.background]="item.gradient">
                      <span class="plc-cat" [style.background]="item.categoryColor + '22'" [style.color]="item.categoryColor">
                        {{ item.category }}
                      </span>
                    </div>
                    <div class="plc-body">
                      <h4 class="plc-title">{{ item.title }}</h4>
                      <span class="plc-price">{{ item.price }}</span>
                    </div>
                  </a>
                }
              </div>
            } @else {
              <div style="text-align:center;padding:48px 24px;color:var(--hy-text-muted)">
                <i class="bi bi-layout-text-sidebar" style="font-size:2.5rem;display:block;margin-bottom:12px"></i>
                <p style="margin:0;font-size:0.95rem">No listings yet</p>
              </div>
            }
          }

          <!-- Reviews Tab -->
          @if (activeTab() === 'Reviews') {
            <div class="reviews-list">
              @if (profile.reviews.length > 0) {
                <div class="rating-summary">
                  <div class="rating-big">{{ profile.rating }}</div>
                  <div class="rating-stars">
                    @for (s of [1,2,3,4,5]; track s) {
                      <i class="bi bi-star-fill" [style.color]="s <= Math.floor(profile.rating) ? '#D4822A' : '#DDD5C8'"></i>
                    }
                  </div>
                  <div class="rating-count">Based on {{ profile.reviewsCount }} reviews</div>
                </div>
                <div class="review-cards">
                  @for (review of profile.reviews; track review.id) {
                    <div class="review-card">
                      <div class="review-header">
                        <div class="reviewer-avatar" [style.background]="review.avatarColor">{{ review.authorInitials }}</div>
                        <div class="reviewer-info">
                          <div class="reviewer-name">{{ review.author }}</div>
                          <div class="reviewer-date">{{ review.date }}</div>
                        </div>
                        <div class="review-stars">
                          @for (s of [1,2,3,4,5]; track s) {
                            <i class="bi bi-star-fill" [style.color]="s <= review.rating ? '#D4822A' : '#DDD5C8'"></i>
                          }
                        </div>
                      </div>
                      <p class="review-text">{{ review.content }}</p>
                    </div>
                  }
                </div>
              } @else {
                <div style="text-align:center;padding:48px 24px;color:var(--hy-text-muted)">
                  <i class="bi bi-star" style="font-size:2.5rem;display:block;margin-bottom:12px"></i>
                  <p style="margin:0;font-size:0.95rem">No reviews yet</p>
                </div>
              }
            </div>
          }

          <!-- About Tab -->
          @if (activeTab() === 'About') {
            <div class="about-section">
              <div class="about-card">
                <h4 class="about-heading">About {{ profile.name }}</h4>
                <p class="about-text">{{ profile.bio }}</p>
                <p class="about-text">{{ profile.extendedBio }}</p>
              </div>
              <div class="about-details">
                <div class="detail-item">
                  <i class="bi bi-geo-alt"></i>
                  <div>
                    <div class="detail-label">Location</div>
                    <div class="detail-val">{{ profile.location }}</div>
                  </div>
                </div>
                <div class="detail-item">
                  <i class="bi bi-calendar3"></i>
                  <div>
                    <div class="detail-label">Member Since</div>
                    <div class="detail-val">{{ profile.memberSince }}</div>
                  </div>
                </div>
                <div class="detail-item">
                  <i class="bi bi-chat-dots"></i>
                  <div>
                    <div class="detail-label">Response Rate</div>
                    <div class="detail-val">{{ profile.responseRate }}</div>
                  </div>
                </div>
              </div>
            </div>
          }

        </div>
      </div>

      } <!-- end @else -->
    </div>
  `,
  styles: [`
    :host { display: block; }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    // ---- Cover ----
    .profile-cover {
      position: relative;
      height: 220px;
      background: var(--hy-gradient-dusk);
      overflow: hidden;

      @media (max-width: 768px) { height: 160px; }
    }

    .cover-pattern {
      position: absolute; inset: 0;
      background-image:
        repeating-linear-gradient(
          45deg,
          rgba(255,255,255,0.04) 0px,
          rgba(255,255,255,0.04) 1px,
          transparent 1px,
          transparent 20px
        );
    }

    .cover-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(181,38,30,0.3) 0%, rgba(212,130,42,0.15) 100%);
    }

    .cover-stripe {
      position: absolute; bottom: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(to right, #D90012 33%, #0033A0 33%, #0033A0 66%, #F2A800 66%);
    }

    // ---- Container ----
    .profile-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 24px 60px;

      @media (max-width: 640px) { padding: 0 16px 48px; }
    }

    // ---- Header Card ----
    .profile-header-card {
      background: var(--hy-surface);
      border: 1px solid var(--hy-border-light);
      border-radius: var(--hy-radius-xl);
      padding: 28px 32px;
      margin-top: -80px;
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 24px;
      align-items: start;
      box-shadow: var(--hy-shadow-lg);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        text-align: center;
        margin-top: -50px;
        padding: 20px;
      }
    }

    .avatar-section {
      @media (max-width: 768px) {
        display: flex;
        justify-content: center;
      }
    }

    .avatar-xl {
      position: relative;
      width: 88px; height: 88px;
      border-radius: 50%;
      background: var(--hy-gradient-warm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--hy-font-display);
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      border: 4px solid var(--hy-surface);
      box-shadow: 0 4px 20px rgba(181,38,30,0.3);
    }

    .avatar-online {
      position: absolute;
      bottom: 4px; right: 4px;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: #4ade80;
      border: 3px solid var(--hy-surface);
    }

    .profile-info { flex: 1; }

    .profile-name-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;

      @media (max-width: 768px) { justify-content: center; }
    }

    .profile-name {
      font-family: var(--hy-font-display);
      font-size: 1.7rem;
      font-weight: 800;
      color: var(--hy-midnight);
      margin: 0;
      letter-spacing: -0.03em;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .verified-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      background: var(--hy-info-bg);
      color: var(--hy-info);
      border-radius: var(--hy-radius-full);
      font-size: 0.74rem;
      font-weight: 700;

      i { font-size: 12px; }
    }

    .profile-meta-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 14px;

      @media (max-width: 768px) { justify-content: center; }
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.84rem;
      color: var(--hy-text-secondary);

      i { font-size: 12px; }
    }

    .meta-sep { color: var(--hy-border-strong); font-size: 0.8rem; }

    .rating-item {
      gap: 5px;

      strong { color: var(--hy-midnight); font-weight: 700; [data-theme="dark"] & { color: var(--hy-text); } }
      span { color: var(--hy-text-muted); font-size: 0.8rem; }
    }

    .profile-bio {
      font-size: 0.9rem;
      color: var(--hy-text-secondary);
      line-height: 1.65;
      margin: 0;
      max-width: 480px;

      @media (max-width: 768px) { max-width: none; }
    }

    .profile-actions {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      flex-shrink: 0;

      @media (max-width: 768px) {
        justify-content: center;
        flex-wrap: wrap;
      }
    }

    // ---- Stats Row ----
    .profile-stats-row {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--hy-surface);
      border: 1px solid var(--hy-border-light);
      border-radius: var(--hy-radius-lg);
      padding: 20px 32px;
      margin-top: 16px;
      margin-bottom: 28px;

      @media (max-width: 640px) { padding: 16px; gap: 0; flex-wrap: wrap; }
    }

    .profile-stat {
      flex: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ps-val {
      font-family: var(--hy-font-display);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--hy-midnight);
      letter-spacing: -0.03em;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .ps-lbl {
      font-size: 0.76rem;
      color: var(--hy-text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .ps-divider {
      width: 1px;
      height: 40px;
      background: var(--hy-border-light);
      margin: 0 16px;
    }

    // ---- Tabs ----
    .tab-nav {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--hy-border-light);
      margin-bottom: 28px;
      overflow-x: auto;
    }

    .tab-btn {
      padding: 14px 24px;
      border: none;
      background: transparent;
      font-family: var(--hy-font-body);
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--hy-text-secondary);
      cursor: pointer;
      border-bottom: 2.5px solid transparent;
      margin-bottom: -1px;
      transition: var(--hy-transition);
      white-space: nowrap;

      &:hover { color: var(--hy-text); }

      &.active {
        color: var(--hy-pomegranate);
        border-bottom-color: var(--hy-pomegranate);
        font-weight: 600;
      }
    }

    // ---- Listings Grid ----
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .profile-listing-card {
      background: var(--hy-surface);
      border: 1px solid var(--hy-border-light);
      border-radius: var(--hy-radius-lg);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: var(--hy-transition-slow);
      display: flex;
      flex-direction: column;

      &:hover {
        box-shadow: var(--hy-shadow-md);
        transform: translateY(-4px);
        border-color: transparent;
      }
    }

    .plc-image {
      height: 160px;
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: 12px;
    }

    .plc-cat {
      padding: 4px 10px;
      border-radius: var(--hy-radius-full);
      font-size: 0.72rem;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .plc-body {
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .plc-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--hy-midnight);
      margin: 0;
      line-height: 1.3;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .plc-price {
      font-family: var(--hy-font-display);
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--hy-pomegranate);
    }

    // ---- Reviews ----
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .rating-summary {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 24px 28px;
      background: var(--hy-surface);
      border: 1px solid var(--hy-border-light);
      border-radius: var(--hy-radius-lg);
    }

    .rating-big {
      font-family: var(--hy-font-display);
      font-size: 3.5rem;
      font-weight: 900;
      color: var(--hy-midnight);
      line-height: 1;
      letter-spacing: -0.04em;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .rating-stars {
      display: flex;
      gap: 4px;
      font-size: 18px;
    }

    .rating-count {
      font-size: 0.84rem;
      color: var(--hy-text-muted);
      margin-top: 4px;
    }

    .review-cards {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .review-card {
      background: var(--hy-surface);
      border: 1px solid var(--hy-border-light);
      border-radius: var(--hy-radius-lg);
      padding: 20px 24px;
      transition: var(--hy-transition);

      &:hover {
        box-shadow: var(--hy-shadow-sm);
        border-color: var(--hy-border-strong);
      }
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .reviewer-avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--hy-font-display);
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .reviewer-info { flex: 1; }

    .reviewer-name {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--hy-midnight);

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .reviewer-date {
      font-size: 0.75rem;
      color: var(--hy-text-muted);
      margin-top: 2px;
    }

    .review-stars {
      display: flex;
      gap: 3px;
      font-size: 13px;
    }

    .review-text {
      font-size: 0.9rem;
      color: var(--hy-text);
      line-height: 1.7;
      margin: 0;
    }

    // ---- About ----
    .about-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .about-card {
      background: var(--hy-surface);
      border: 1px solid var(--hy-border-light);
      border-radius: var(--hy-radius-lg);
      padding: 24px 28px;
    }

    .about-heading {
      font-family: var(--hy-font-display);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--hy-midnight);
      margin: 0 0 16px;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .about-text {
      font-size: 0.9rem;
      color: var(--hy-text-secondary);
      line-height: 1.75;
      margin: 0 0 12px;

      &:last-child { margin: 0; }
    }

    .about-details {
      background: var(--hy-surface);
      border: 1px solid var(--hy-border-light);
      border-radius: var(--hy-radius-lg);
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      i {
        font-size: 16px;
        color: var(--hy-pomegranate);
        margin-top: 2px;
        flex-shrink: 0;
      }
    }

    .detail-label {
      font-size: 0.74rem;
      color: var(--hy-text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .detail-val {
      font-size: 0.88rem;
      color: var(--hy-text);
      font-weight: 500;
    }
  `],
})
export class ProfileComponent implements OnInit {
  Math = Math;
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  activeTab = signal<string>('Listings');
  tabs = ['Listings', 'Reviews', 'About'];
  loading = true;
  error = '';

  private readonly typeColors: Record<string, { color: string; gradient: string }> = {
    marketplace: { color: '#1A4FA0', gradient: 'linear-gradient(135deg, #1A4FA0, #3B7DD8)' },
    jobs:        { color: '#D4822A', gradient: 'linear-gradient(135deg, #D4822A, #F0A84E)' },
    housing:     { color: '#1E7A50', gradient: 'linear-gradient(135deg, #1E7A50, #28A869)' },
    businesses:  { color: '#B5261E', gradient: 'linear-gradient(135deg, #B5261E, #D4822A)' },
    events:      { color: '#7A3B8C', gradient: 'linear-gradient(135deg, #7A3B8C, #A855F7)' },
    cars:        { color: '#0F3460', gradient: 'linear-gradient(135deg, #0F3460, #1A4FA0)' },
  };

  profile = {
    name: '',
    location: '',
    memberSince: '',
    bio: '',
    extendedBio: '',
    listingsCount: 0,
    reviewsCount: 0,
    rating: 0,
    responseRate: '—',
    listings: [] as ProfileListing[],
    reviews: [] as ProfileReview[],
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'Profile not found.'; this.loading = false; return; }

    this.api.getProfile(id).subscribe({
      next: (p) => {
        this.profile.name = p.full_name ?? 'Unknown';
        this.profile.location = p.city ?? '';
        this.profile.memberSince = new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        this.profile.bio = p.bio ?? '';
        this.profile.extendedBio = '';
        this.loading = false;
      },
      error: () => { this.error = 'Profile not found.'; this.loading = false; },
    });

    this.api.getListings({ user_id: id, limit: 50 }).subscribe({
      next: (res) => {
        this.profile.listings = res.data.map((l: ApiListing) => {
          const slug = l.listing_types?.slug ?? '';
          const style = this.typeColors[slug] ?? { color: '#1A4FA0', gradient: 'linear-gradient(135deg, #1A4FA0, #3B7DD8)' };
          const price = l.listing_price_label
            ? l.listing_price_label
            : l.listing_price != null
              ? `$${l.listing_price.toLocaleString()}`
              : 'Contact';
          return {
            id: l.id,
            title: l.title,
            category: l.listing_types?.label ?? 'Other',
            price,
            gradient: style.gradient,
            categoryColor: style.color,
          };
        });
        this.profile.listingsCount = res.total;
      },
    });
  }
}
