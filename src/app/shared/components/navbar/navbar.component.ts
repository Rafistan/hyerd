import {
  Component,
  signal,
  computed,
  inject,
  HostListener,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

interface NavCategory {
  label: string;
  route: string;
  icon: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
    <!-- Armenian Color Band -->
    <div class="armenian-band"></div>

    <nav class="navbar" [class.scrolled]="isScrolled()">
      <div class="navbar-inner">

        <!-- Logo -->
        <a routerLink="/" class="brand" (click)="closeAll()">
          <span class="brand-pomegranate" aria-hidden="true">
            <span class="pom-body"></span>
            <span class="pom-stem"></span>
            <span class="pom-crown">
              <span></span><span></span><span></span>
            </span>
          </span>
          <span class="brand-wordmark">Hyerd</span>
        </a>

        <!-- Desktop nav -->
        <div class="nav-center">
          <div class="nav-links">
            @for (cat of categories; track cat.route) {
              <a
                [routerLink]="cat.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-link"
              >{{ cat.label }}</a>
            }
          </div>
        </div>

        <!-- Right actions -->
        <div class="nav-right">
          <button class="nav-icon-btn search-trigger" title="Search" (click)="toggleSearch()">
            <i class="bi bi-search"></i>
          </button>

          <a routerLink="/messages" class="nav-icon-btn msg-btn" title="Messages">
            <i class="bi bi-chat-dots"></i>
            <span class="msg-badge">3</span>
          </a>

          <app-theme-toggle />

          @if (!currentUser()) {
            <a routerLink="/login" class="btn-hy btn-hy-outline nav-auth-btn">Sign in</a>
          }

          <a routerLink="/listings/new" class="btn-hy btn-hy-primary nav-post-btn">
            <i class="bi bi-plus-lg"></i>
            Post Listing
          </a>

          @if (currentUser()) {
            <a routerLink="/dashboard" class="nav-icon-btn dashboard-btn" title="Dashboard" routerLinkActive="active">
              <i class="bi bi-speedometer2"></i>
            </a>
            <a class="nav-icon-btn user-btn" title="My Profile" [routerLink]="['/profile', currentUser()!.id]">
              <i class="bi bi-person"></i>
            </a>
          }

          <!-- Mobile hamburger -->
          <button
            class="hamburger"
            (click)="toggleMobile()"
            [attr.aria-expanded]="mobileOpen()"
            aria-label="Toggle navigation"
          >
            <span class="ham-line" [class.open]="mobileOpen()"></span>
            <span class="ham-line" [class.open]="mobileOpen()"></span>
            <span class="ham-line" [class.open]="mobileOpen()"></span>
          </button>
        </div>
      </div>

      <!-- Search Overlay -->
      @if (searchOpen()) {
        <div class="search-overlay" (click)="closeSearch()">
          <div class="search-overlay-inner" (click)="$event.stopPropagation()">
            <div class="search-field">
              <i class="bi bi-search search-field-icon"></i>
              <input
                type="text"
                placeholder="Search businesses, jobs, housing, events…"
                class="search-field-input"
                autofocus
                (keyup.escape)="closeSearch()"
              />
              <button class="search-field-close" (click)="closeSearch()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="search-categories">
              @for (cat of categories; track cat.route) {
                <a [routerLink]="cat.route" class="search-cat-pill" (click)="closeSearch()">
                  <i [class]="cat.icon"></i>
                  {{ cat.label }}
                </a>
              }
            </div>
          </div>
        </div>
      }
    </nav>

    <!-- Mobile Drawer -->
    <div class="mobile-overlay" [class.open]="mobileOpen()" (click)="closeMobile()">
      <div class="mobile-drawer" [class.open]="mobileOpen()" (click)="$event.stopPropagation()">
        <div class="mobile-drawer-header">
          <a routerLink="/" class="brand" (click)="closeMobile()">
            <span class="brand-wordmark">Hyerd</span>
          </a>
          <button class="mobile-close-btn" (click)="closeMobile()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <nav class="mobile-nav">
          @for (cat of categories; track cat.route; let i = $index) {
            <a
              [routerLink]="cat.route"
              routerLinkActive="active"
              class="mobile-nav-link"
              (click)="closeMobile()"
              [style.animation-delay]="(i * 50) + 'ms'"
            >
              <span class="mobile-link-icon" [style.background]="cat.color">
                <i [class]="cat.icon"></i>
              </span>
              <div class="mobile-link-content">
                <span class="mobile-link-label">{{ cat.label }}</span>
                <span class="mobile-link-desc">{{ cat.description }}</span>
              </div>
              <i class="bi bi-chevron-right mobile-link-arrow"></i>
            </a>
          }
        </nav>

        <div class="mobile-drawer-footer">
          @if (currentUser()) {
            <a [routerLink]="['/profile', currentUser()!.id]" class="btn-hy btn-hy-outline" style="width:100%" (click)="closeMobile()">My Profile</a>
            <a routerLink="/dashboard" class="btn-hy btn-hy-outline" style="width:100%" (click)="closeMobile()">Dashboard</a>
          } @else {
            <a routerLink="/login" class="btn-hy btn-hy-outline" style="width:100%" (click)="closeMobile()">Sign In</a>
          }
          <a routerLink="/listings/new" class="btn-hy btn-hy-primary" style="width:100%" (click)="closeMobile()">
            <i class="bi bi-plus-lg"></i> Post a Listing
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    // Armenian tricolor band at top of page
    .armenian-band {
      height: 3px;
      background: linear-gradient(
        to right,
        #D90012 0%, #D90012 33.33%,
        #0033A0 33.33%, #0033A0 66.66%,
        #F2A800 66.66%, #F2A800 100%
      );
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1001;
    }

    .navbar {
      position: fixed;
      top: 3px;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--hy-surface);
      border-bottom: 1px solid transparent;
      transition: all 0.3s var(--hy-ease);

      &.scrolled {
        border-bottom-color: var(--hy-border-light);
        box-shadow: 0 4px 24px rgba(44, 36, 32, 0.08);
        backdrop-filter: blur(12px);
        background: rgba(255, 253, 249, 0.94);

        [data-theme="dark"] & {
          background: rgba(30, 21, 49, 0.94);
        }
      }
    }

    .navbar-inner {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 28px;
      height: 70px;
      display: flex;
      align-items: center;
      gap: 32px;

      @media (max-width: 640px) {
        padding: 0 16px;
        height: 64px;
        gap: 12px;
      }
    }

    // ---- Brand / Logo ----
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }

    .brand-pomegranate {
      position: relative;
      width: 26px;
      height: 30px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      flex-shrink: 0;
    }

    .pom-body {
      position: absolute;
      bottom: 0;
      width: 24px;
      height: 22px;
      background: var(--hy-gradient-warm);
      border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%;
      box-shadow: 0 3px 10px rgba(181, 38, 30, 0.35);
      transition: var(--hy-transition);
    }

    .pom-stem {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 8px;
      background: #1E7A50;
      border-radius: 2px;
    }

    .pom-crown {
      position: absolute;
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 2px;
      align-items: flex-end;

      span {
        width: 2px;
        background: #1E7A50;
        border-radius: 2px;

        &:nth-child(1) { height: 5px; }
        &:nth-child(2) { height: 7px; }
        &:nth-child(3) { height: 5px; }
      }
    }

    .brand:hover .pom-body {
      transform: scale(1.08);
    }

    .brand-wordmark {
      font-family: var(--hy-font-display);
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--hy-midnight);
      transition: color 0.2s;

      [data-theme="dark"] & {
        color: var(--hy-text);
      }
    }

    .brand:hover .brand-wordmark {
      color: var(--hy-pomegranate);
    }

    // ---- Desktop Nav Center ----
    .nav-center {
      flex: 1;
      display: flex;
      align-items: center;

      @media (max-width: 900px) {
        display: none;
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .nav-link {
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--hy-text-secondary);
      text-decoration: none;
      padding: 8px 14px;
      border-radius: var(--hy-radius-sm);
      transition: var(--hy-transition);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 14px;
        right: 14px;
        height: 2px;
        background: var(--hy-pomegranate);
        border-radius: 2px;
        transform: scaleX(0);
        transition: transform 0.2s var(--hy-ease);
      }

      &:hover {
        color: var(--hy-midnight);
        background: var(--hy-bg-alt);

        [data-theme="dark"] & {
          color: var(--hy-text);
          background: var(--hy-bg-alt);
        }
      }

      &.active {
        color: var(--hy-pomegranate);
        font-weight: 600;

        &::after {
          transform: scaleX(1);
        }
      }
    }

    // ---- Right Actions ----
    .nav-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      margin-left: auto;
    }

    .nav-icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1.5px solid var(--hy-border-light);
      background: transparent;
      color: var(--hy-text-secondary);
      font-size: 16px;
      cursor: pointer;
      text-decoration: none;
      transition: var(--hy-transition);
      position: relative;

      &:hover {
        color: var(--hy-pomegranate);
        border-color: var(--hy-pomegranate);
        background: rgba(181, 38, 30, 0.05);
      }
    }

    .msg-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 16px;
      height: 16px;
      background: var(--hy-pomegranate);
      color: #fff;
      border-radius: 50%;
      font-size: 0.62rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--hy-surface);
    }

    .nav-auth-btn {
      display: flex;

      @media (max-width: 900px) {
        display: none;
      }
    }

    .nav-post-btn {
      display: flex;
      gap: 6px;
      padding: 9px 18px;
      font-size: 0.85rem;

      @media (max-width: 900px) {
        display: none;
      }
    }

    .dashboard-btn, .user-btn {
      @media (max-width: 900px) {
        display: none;
      }
    }

    // ---- Hamburger ----
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;
      border-radius: var(--hy-radius-sm);

      @media (max-width: 900px) {
        display: flex;
      }

      &:hover {
        background: var(--hy-bg-alt);
      }
    }

    .ham-line {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--hy-text);
      border-radius: 2px;
      transition: all 0.3s var(--hy-ease);
      transform-origin: center;

      &:nth-child(1).open {
        transform: translateY(7px) rotate(45deg);
      }
      &:nth-child(2).open {
        opacity: 0;
        transform: scaleX(0);
      }
      &:nth-child(3).open {
        transform: translateY(-7px) rotate(-45deg);
      }
    }

    // ---- Search Overlay ----
    .search-overlay {
      position: fixed;
      inset: 73px 0 0 0;
      background: rgba(30, 21, 49, 0.5);
      backdrop-filter: blur(4px);
      z-index: 999;
      animation: hy-fadeIn 0.2s ease;
    }

    .search-overlay-inner {
      background: var(--hy-surface);
      padding: 24px 28px;
      border-bottom: 1px solid var(--hy-border-light);
      max-width: 800px;
      margin: 0 auto;
      border-radius: 0 0 var(--hy-radius-lg) var(--hy-radius-lg);
      box-shadow: var(--hy-shadow-lg);
      animation: hy-fadeInUp 0.25s var(--hy-ease);
    }

    .search-field {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--hy-bg-alt);
      border-radius: var(--hy-radius);
      padding: 14px 20px;
      margin-bottom: 16px;
      border: 1.5px solid var(--hy-border);
      transition: border-color 0.2s;

      &:focus-within {
        border-color: var(--hy-pomegranate);
      }
    }

    .search-field-icon {
      color: var(--hy-text-muted);
      font-size: 16px;
      flex-shrink: 0;
    }

    .search-field-input {
      flex: 1;
      border: none;
      background: transparent;
      font-family: var(--hy-font-body);
      font-size: 1rem;
      color: var(--hy-text);
      outline: none;

      &::placeholder {
        color: var(--hy-text-muted);
      }
    }

    .search-field-close {
      border: none;
      background: transparent;
      color: var(--hy-text-muted);
      font-size: 14px;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;

      &:hover {
        color: var(--hy-pomegranate);
      }
    }

    .search-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .search-cat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      background: var(--hy-bg-alt);
      color: var(--hy-text-secondary);
      border-radius: var(--hy-radius-full);
      font-size: 0.83rem;
      font-weight: 500;
      text-decoration: none;
      border: 1px solid var(--hy-border-light);
      transition: var(--hy-transition);

      &:hover {
        background: var(--hy-pomegranate);
        color: #fff;
        border-color: var(--hy-pomegranate);
      }
    }

    // ---- Mobile Drawer ----
    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(30, 21, 49, 0);
      z-index: 1100;
      pointer-events: none;
      transition: background 0.3s ease;

      &.open {
        background: rgba(30, 21, 49, 0.55);
        pointer-events: all;
        backdrop-filter: blur(3px);
      }
    }

    .mobile-drawer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(340px, 92vw);
      background: var(--hy-surface);
      transform: translateX(100%);
      transition: transform 0.38s var(--hy-ease);
      display: flex;
      flex-direction: column;
      box-shadow: -8px 0 48px rgba(30, 21, 49, 0.2);
      overflow-y: auto;

      &.open {
        transform: translateX(0);
      }
    }

    .mobile-drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 20px;
      border-bottom: 1px solid var(--hy-border-light);
      flex-shrink: 0;
    }

    .mobile-close-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: var(--hy-bg-alt);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--hy-text-secondary);
      font-size: 14px;
      transition: var(--hy-transition);

      &:hover {
        background: var(--hy-pomegranate);
        color: #fff;
      }
    }

    .mobile-nav {
      flex: 1;
      padding: 12px 0;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 20px;
      text-decoration: none;
      color: var(--hy-text);
      transition: var(--hy-transition);
      border-left: 3px solid transparent;
      animation: hy-slideInLeft 0.3s var(--hy-ease) both;

      &:hover {
        background: var(--hy-bg-alt);
        border-left-color: var(--hy-pomegranate);
      }

      &.active {
        background: rgba(181, 38, 30, 0.06);
        border-left-color: var(--hy-pomegranate);
        color: var(--hy-pomegranate);
      }
    }

    .mobile-link-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--hy-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 16px;
      color: #fff;
    }

    .mobile-link-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .mobile-link-label {
      font-size: 0.92rem;
      font-weight: 600;
      line-height: 1;
    }

    .mobile-link-desc {
      font-size: 0.76rem;
      color: var(--hy-text-muted);
      line-height: 1.3;
    }

    .mobile-link-arrow {
      font-size: 12px;
      color: var(--hy-border-strong);
    }

    .mobile-drawer-footer {
      padding: 20px;
      border-top: 1px solid var(--hy-border-light);
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
    }

    // Animation references
    @keyframes hy-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes hy-fadeInUp {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes hy-slideInLeft {
      from { opacity: 0; transform: translateX(16px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `],
})
export class NavbarComponent implements OnInit {
  private themeService = inject(ThemeService);
  private auth = inject(AuthService);

  currentUser = toSignal(this.auth.currentUser$, { initialValue: null });

  isScrolled = signal(false);
  mobileOpen = signal(false);
  searchOpen = signal(false);

  categories: NavCategory[] = [
    {
      label: 'Directory',
      route: '/directory',
      icon: 'bi bi-building',
      description: 'Armenian-owned businesses',
      color: 'linear-gradient(135deg, #B5261E, #D4822A)',
    },
    {
      label: 'Jobs',
      route: '/jobs',
      icon: 'bi bi-briefcase',
      description: 'Career opportunities',
      color: 'linear-gradient(135deg, #1A4FA0, #3B7DD8)',
    },
    {
      label: 'Housing',
      route: '/housing',
      icon: 'bi bi-house',
      description: 'Homes & apartments',
      color: 'linear-gradient(135deg, #1E7A50, #28A869)',
    },
    {
      label: 'Cars',
      route: '/cars',
      icon: 'bi bi-car-front',
      description: 'Buy & sell vehicles',
      color: 'linear-gradient(135deg, #7A3B8C, #A855F7)',
    },
    {
      label: 'Events',
      route: '/events',
      icon: 'bi bi-calendar-event',
      description: 'Community gatherings',
      color: 'linear-gradient(135deg, #D4822A, #F0A84E)',
    },
    {
      label: 'Marketplace',
      route: '/marketplace',
      icon: 'bi bi-shop',
      description: 'Buy & sell anything',
      color: 'linear-gradient(135deg, #2D6A6A, #4DAAAA)',
    },
  ];

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
    if (this.searchOpen()) this.searchOpen.set(false);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  toggleSearch(): void {
    this.searchOpen.update(v => !v);
    if (this.mobileOpen()) this.mobileOpen.set(false);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  closeAll(): void {
    this.mobileOpen.set(false);
    this.searchOpen.set(false);
  }
}
