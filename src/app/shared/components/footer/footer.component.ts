import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <!-- Top decorative band -->
      <div class="footer-top-band"></div>

      <div class="footer-body">
        <div class="footer-inner">

          <!-- Brand Column -->
          <div class="footer-brand-col">
            <a routerLink="/" class="footer-logo">
              <span class="footer-logo-mark">
                <span class="pom-body"></span>
                <span class="pom-crown"><span></span><span></span><span></span></span>
              </span>
              <span class="footer-logo-text">Hyerd</span>
            </a>
            <p class="footer-tagline">
              Connecting the Armenian diaspora — one community at a time.
            </p>
            <div class="social-row">
              <a href="#" class="social-btn" aria-label="Facebook">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="#" class="social-btn" aria-label="Instagram">
                <i class="bi bi-instagram"></i>
              </a>
              <a href="#" class="social-btn" aria-label="Twitter/X">
                <i class="bi bi-twitter-x"></i>
              </a>
              <a href="#" class="social-btn" aria-label="LinkedIn">
                <i class="bi bi-linkedin"></i>
              </a>
              <a href="#" class="social-btn" aria-label="Discord">
                <i class="bi bi-discord"></i>
              </a>
            </div>
          </div>

          <!-- Discover Column -->
          <div class="footer-col">
            <h4 class="footer-col-title">Discover</h4>
            <ul class="footer-links">
              <li><a routerLink="/directory" class="footer-link"><i class="bi bi-building"></i> Directory</a></li>
              <li><a routerLink="/jobs" class="footer-link"><i class="bi bi-briefcase"></i> Jobs Board</a></li>
              <li><a routerLink="/housing" class="footer-link"><i class="bi bi-house"></i> Housing</a></li>
              <li><a routerLink="/cars" class="footer-link"><i class="bi bi-car-front"></i> Cars</a></li>
              <li><a routerLink="/events" class="footer-link"><i class="bi bi-calendar-event"></i> Events</a></li>
              <li><a routerLink="/marketplace" class="footer-link"><i class="bi bi-shop"></i> Marketplace</a></li>
            </ul>
          </div>

          <!-- Company Column -->
          <div class="footer-col">
            <h4 class="footer-col-title">Company</h4>
            <ul class="footer-links">
              <li><a routerLink="/about" class="footer-link">About Us</a></li>
              <li><a routerLink="/careers" class="footer-link">Careers</a></li>
              <li><a routerLink="/press" class="footer-link">Press</a></li>
              <li><a routerLink="/blog" class="footer-link">Blog</a></li>
              <li><a routerLink="/contact" class="footer-link">Contact</a></li>
            </ul>
          </div>

          <!-- Support Column -->
          <div class="footer-col">
            <h4 class="footer-col-title">Support</h4>
            <ul class="footer-links">
              <li><a routerLink="/help" class="footer-link">Help Center</a></li>
              <li><a routerLink="/safety" class="footer-link">Safety Tips</a></li>
              <li><a routerLink="/community-guidelines" class="footer-link">Guidelines</a></li>
              <li><a routerLink="/privacy" class="footer-link">Privacy Policy</a></li>
              <li><a routerLink="/terms" class="footer-link">Terms of Service</a></li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Newsletter -->
      <div class="footer-newsletter">
        <div class="footer-inner newsletter-inner">
          <div class="newsletter-text">
            <h4 class="newsletter-heading">Stay connected to the community</h4>
            <p class="newsletter-sub">Get the latest news, events & opportunities delivered weekly.</p>
          </div>
          <form class="newsletter-form" (submit)="$event.preventDefault()">
            <input
              type="email"
              placeholder="you@example.com"
              class="newsletter-input"
              aria-label="Email address"
            />
            <button type="submit" class="btn-hy btn-hy-primary newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <div class="footer-inner bottom-inner">
          <p class="footer-copy">
            &copy; {{ year }} Hyerd. All rights reserved.
          </p>
          <p class="footer-heart">
            Made with
            <span class="heart-icon" aria-hidden="true">♥</span>
            for the Armenian community
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--hy-midnight);
      color: rgba(255, 255, 255, 0.75);
      margin-top: 0;
    }

    .footer-top-band {
      height: 3px;
      background: var(--hy-gradient-warm);
    }

    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 28px;

      @media (max-width: 640px) {
        padding: 0 16px;
      }
    }

    // ---- Body ----
    .footer-body {
      padding: 64px 0 48px;

      @media (max-width: 768px) {
        padding: 48px 0 40px;
      }
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 48px;
      align-items: start;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr 1fr;
        gap: 36px;
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }

    // ---- Brand Col ----
    .footer-brand-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .footer-logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .footer-logo-mark {
      position: relative;
      width: 24px;
      height: 26px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .pom-body {
      position: absolute;
      bottom: 0;
      width: 22px;
      height: 20px;
      background: var(--hy-gradient-warm);
      border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%;
    }

    .pom-crown {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 2px;
      align-items: flex-end;

      span {
        width: 2px;
        background: #4ade80;
        border-radius: 2px;

        &:nth-child(1) { height: 4px; }
        &:nth-child(2) { height: 6px; }
        &:nth-child(3) { height: 4px; }
      }
    }

    .footer-logo-text {
      font-family: var(--hy-font-display);
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #fff;
    }

    .footer-tagline {
      font-size: 0.88rem;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.55);
      max-width: 280px;
    }

    .social-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .social-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      text-decoration: none;
      transition: var(--hy-transition);
      border: 1px solid rgba(255, 255, 255, 0.1);

      &:hover {
        background: var(--hy-pomegranate);
        color: #fff;
        border-color: var(--hy-pomegranate);
        transform: translateY(-2px);
      }
    }

    // ---- Link Columns ----
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .footer-col-title {
      font-family: var(--hy-font-body);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.35);
      margin: 0;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 0.88rem;
      transition: var(--hy-transition);

      i {
        font-size: 13px;
        opacity: 0.6;
      }

      &:hover {
        color: #fff;
        padding-left: 4px;
      }
    }

    // ---- Newsletter ----
    .footer-newsletter {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 32px 0;
    }

    .newsletter-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .newsletter-heading {
      font-family: var(--hy-font-display);
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }

    .newsletter-sub {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    .newsletter-form {
      display: flex;
      gap: 10px;
      flex-shrink: 0;

      @media (max-width: 480px) {
        flex-direction: column;
        width: 100%;
      }
    }

    .newsletter-input {
      padding: 11px 18px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--hy-radius-sm);
      color: #fff;
      font-family: var(--hy-font-body);
      font-size: 0.88rem;
      outline: none;
      min-width: 220px;
      transition: var(--hy-transition);

      &::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }

      &:focus {
        border-color: var(--hy-pomegranate);
        background: rgba(255, 255, 255, 0.12);
      }

      @media (max-width: 480px) {
        min-width: 0;
        width: 100%;
      }
    }

    .newsletter-btn {
      flex-shrink: 0;
    }

    // ---- Bottom Bar ----
    .footer-bottom {
      padding: 24px 0;
    }

    .bottom-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;

      @media (max-width: 640px) {
        flex-direction: column;
        text-align: center;
      }
    }

    .footer-copy {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.3);
      margin: 0;
    }

    .footer-heart {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.3);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .heart-icon {
      color: var(--hy-pomegranate);
      animation: hy-heartbeat 1.6s ease-in-out infinite;
    }

    @keyframes hy-heartbeat {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.18); }
      50% { transform: scale(1); }
      75% { transform: scale(1.08); }
    }
  `],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
