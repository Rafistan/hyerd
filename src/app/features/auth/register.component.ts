import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">

      <!-- Left Panel -->
      <div class="auth-panel-visual" aria-hidden="true">
        <div class="visual-bg">
          <div class="vb1"></div>
          <div class="vb2"></div>
          <div class="vg"></div>
        </div>
        <div class="visual-content">
          <div class="visual-logo">
            <span class="vl-mark">
              <span class="pb"></span>
              <span class="pc"><span></span><span></span><span></span></span>
            </span>
            <span class="vl-text">Hyerd</span>
          </div>
          <h2 class="visual-headline">
            Join 50,000+ Armenians<br/>already connected.
          </h2>
          <ul class="visual-benefits">
            <li><i class="bi bi-check-circle-fill"></i> Free to join — always</li>
            <li><i class="bi bi-check-circle-fill"></i> Post listings in seconds</li>
            <li><i class="bi bi-check-circle-fill"></i> Connect with verified community members</li>
            <li><i class="bi bi-check-circle-fill"></i> Discover businesses, jobs & events near you</li>
          </ul>
        </div>
        <div class="visual-strip"></div>
      </div>

      <!-- Right Panel: Form -->
      <div class="auth-panel-form">
        <div class="auth-form-wrap">

          <div class="auth-header">
            <h1 class="auth-heading">Create your account</h1>
            <p class="auth-subheading">It's free and takes less than 2 minutes.</p>
          </div>

          <!-- Social buttons -->
          <div class="social-btns">
            <button type="button" class="social-btn" (click)="signInWithGoogle()" [disabled]="googleLoading()">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </div>

          <div class="auth-divider">
            <span>or sign up with email</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>

            <div class="form-row-2">
              <div class="field-group">
                <label for="firstName" class="field-label">First Name</label>
                <div class="field-wrap" [class.has-error]="showError('firstName')">
                  <input id="firstName" type="text" placeholder="Aram" formControlName="firstName" class="field-input" />
                </div>
              </div>
              <div class="field-group">
                <label for="lastName" class="field-label">Last Name</label>
                <div class="field-wrap" [class.has-error]="showError('lastName')">
                  <input id="lastName" type="text" placeholder="Petrosyan" formControlName="lastName" class="field-input" />
                </div>
              </div>
            </div>

            <div class="field-group">
              <label for="email" class="field-label">Email Address</label>
              <div class="field-wrap" [class.has-error]="showError('email')">
                <i class="bi bi-envelope field-icon"></i>
                <input id="email" type="email" placeholder="you@example.com" formControlName="email" class="field-input" autocomplete="email" />
              </div>
              @if (showError('email')) {
                <span class="field-error"><i class="bi bi-exclamation-circle"></i> Enter a valid email</span>
              }
            </div>

            <div class="field-group">
              <label for="password" class="field-label">Password</label>
              <div class="field-wrap" [class.has-error]="showError('password')">
                <i class="bi bi-lock field-icon"></i>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  placeholder="Min. 8 characters"
                  formControlName="password"
                  class="field-input"
                  autocomplete="new-password"
                />
                <button type="button" class="toggle-pw" (click)="showPassword.set(!showPassword())">
                  <i [class]="showPassword() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              @if (showError('password')) {
                <span class="field-error"><i class="bi bi-exclamation-circle"></i> At least 8 characters required</span>
              }
              <!-- Password strength -->
              @if (form.get('password')?.value) {
                <div class="pw-strength">
                  <div class="pw-bar" [style.width]="passwordStrengthPct() + '%'" [style.background]="passwordStrengthColor()"></div>
                </div>
                <span class="pw-strength-label" [style.color]="passwordStrengthColor()">
                  {{ passwordStrengthLabel() }}
                </span>
              }
            </div>

            <label class="terms-row">
              <input type="checkbox" formControlName="agreeToTerms" class="terms-check" />
              <span>
                I agree to the <a routerLink="/terms" class="terms-link">Terms of Service</a>
                and <a routerLink="/privacy" class="terms-link">Privacy Policy</a>
              </span>
            </label>

            <button type="submit" class="btn-hy btn-hy-primary auth-submit" [disabled]="loading()">
              @if (loading()) {
                <span class="spin"></span> Creating account…
              } @else {
                Create Free Account <i class="bi bi-arrow-right"></i>
              }
            </button>

          </form>

          <p class="auth-switch">
            Already have an account?
            <a routerLink="/login" class="auth-switch-link">Sign in</a>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .auth-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 100vh;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    // ---- Visual Panel ----
    .auth-panel-visual {
      position: relative;
      background: var(--hy-midnight);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 48px;

      @media (max-width: 900px) {
        display: none;
      }
    }

    .visual-bg { position: absolute; inset: 0; }

    .vb1 {
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, #B5261E, transparent 70%);
      top: -150px; left: -100px;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.28;
    }

    .vb2 {
      position: absolute;
      width: 400px; height: 400px;
      background: radial-gradient(circle, #D4822A, transparent 70%);
      bottom: -120px; right: -80px;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.2;
    }

    .vg {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .visual-strip {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 4px;
      background: var(--hy-gradient-warm);
    }

    .visual-content {
      position: relative;
      z-index: 1;
    }

    .visual-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 36px;
    }

    .vl-mark {
      position: relative;
      width: 28px; height: 32px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .pb {
      position: absolute; bottom: 0;
      width: 26px; height: 24px;
      background: var(--hy-gradient-warm);
      border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%;
    }

    .pc {
      position: absolute; top: 0;
      left: 50%; transform: translateX(-50%);
      display: flex; gap: 2px; align-items: flex-end;

      span {
        width: 2px; background: #4ade80; border-radius: 2px;
        &:nth-child(1) { height: 5px; }
        &:nth-child(2) { height: 8px; }
        &:nth-child(3) { height: 5px; }
      }
    }

    .vl-text {
      font-family: var(--hy-font-display);
      font-size: 1.8rem; font-weight: 900;
      color: #fff; letter-spacing: -0.04em;
    }

    .visual-headline {
      font-family: var(--hy-font-display);
      font-size: 1.9rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
      letter-spacing: -0.03em;
      margin-bottom: 32px;
    }

    .visual-benefits {
      list-style: none;
      padding: 0; margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.95rem;
        color: rgba(255,255,255,0.75);

        i {
          color: #4ade80;
          font-size: 15px;
          flex-shrink: 0;
        }
      }
    }

    // ---- Form Panel ----
    .auth-panel-form {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--hy-bg);
      padding: 48px 24px;
    }

    .auth-form-wrap {
      width: 100%;
      max-width: 440px;
    }

    .auth-header { margin-bottom: 28px; }

    .auth-heading {
      font-family: var(--hy-font-display);
      font-size: 2rem; font-weight: 800;
      color: var(--hy-midnight);
      margin-bottom: 8px;
      letter-spacing: -0.03em;

      [data-theme="dark"] & { color: var(--hy-text); }
    }

    .auth-subheading {
      font-size: 0.92rem;
      color: var(--hy-text-secondary);
      margin: 0;
    }

    .social-btns {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }

    .social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px 20px;
      background: var(--hy-surface);
      border: 1.5px solid var(--hy-border);
      border-radius: var(--hy-radius-sm);
      font-family: var(--hy-font-body);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--hy-text);
      cursor: pointer;
      transition: var(--hy-transition);

      &:hover {
        border-color: var(--hy-pomegranate);
        background: rgba(181,38,30,0.03);
      }
    }

    .auth-divider {
      position: relative;
      text-align: center;
      margin: 20px 0;
      font-size: 0.8rem;
      color: var(--hy-text-muted);

      &::before {
        content: '';
        position: absolute;
        top: 50%; left: 0; right: 0;
        height: 1px;
        background: var(--hy-border-light);
        transform: translateY(-50%);
      }

      span {
        position: relative;
        background: var(--hy-bg);
        padding: 0 14px;
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--hy-text);
      letter-spacing: 0.01em;
    }

    .field-wrap {
      position: relative;
      display: flex;
      align-items: center;
      border: 1.5px solid var(--hy-border);
      border-radius: var(--hy-radius-sm);
      background: var(--hy-surface);
      transition: var(--hy-transition);

      &:focus-within {
        border-color: var(--hy-pomegranate);
        box-shadow: 0 0 0 3px rgba(181,38,30,0.1);
      }

      &.has-error {
        border-color: var(--hy-pomegranate);
        background: var(--hy-error-bg);
      }
    }

    .field-icon {
      padding: 0 12px 0 14px;
      color: var(--hy-text-muted);
      font-size: 15px;
      flex-shrink: 0;
    }

    .field-input {
      flex: 1;
      padding: 13px 14px 13px 0;
      border: none;
      background: transparent;
      font-family: var(--hy-font-body);
      font-size: 0.92rem;
      color: var(--hy-text);
      outline: none;
      min-width: 0;
      width: 100%;

      .form-row-2 & {
        padding: 13px 14px;
      }

      &::placeholder { color: var(--hy-text-muted); }
    }

    .toggle-pw {
      padding: 0 14px;
      border: none; background: transparent;
      color: var(--hy-text-muted);
      cursor: pointer; font-size: 14px;
      display: flex; align-items: center;
      flex-shrink: 0; transition: color 0.2s;

      &:hover { color: var(--hy-text); }
    }

    .field-error {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      color: var(--hy-pomegranate);
      font-weight: 500;

      i { font-size: 12px; }
    }

    // Password strength bar
    .pw-strength {
      height: 3px;
      background: var(--hy-border-light);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 2px;
    }

    .pw-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.4s var(--hy-ease), background 0.3s;
    }

    .pw-strength-label {
      font-size: 0.74rem;
      font-weight: 600;
      margin-top: 3px;
    }

    // Terms
    .terms-row {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      font-size: 0.84rem;
      color: var(--hy-text-secondary);
      cursor: pointer;
      line-height: 1.5;
    }

    .terms-check {
      width: 16px; height: 16px;
      accent-color: var(--hy-pomegranate);
      cursor: pointer; flex-shrink: 0;
      margin-top: 2px;
    }

    .terms-link {
      color: var(--hy-pomegranate);
      font-weight: 500;
    }

    .auth-submit {
      width: 100%; padding: 14px;
      font-size: 0.95rem;
      border-radius: var(--hy-radius-sm);
      gap: 8px; margin-top: 4px;

      &:disabled { opacity: 0.65; cursor: not-allowed; }
    }

    .spin {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: hy-spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    @keyframes hy-spin { to { transform: rotate(360deg); } }

    .auth-switch {
      text-align: center;
      margin-top: 24px;
      font-size: 0.88rem;
      color: var(--hy-text-secondary);
    }

    .auth-switch-link {
      color: var(--hy-pomegranate);
      font-weight: 600;
      margin-left: 4px;
    }
  `],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  loading = signal(false);
  googleLoading = signal(false);
  submitError = signal('');

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    agreeToTerms: [false, Validators.requiredTrue],
  });

  showError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  passwordStrengthPct(): number {
    const pw = this.form.get('password')?.value ?? '';
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (pw.length >= 12) score += 15;
    if (/[A-Z]/.test(pw)) score += 20;
    if (/[0-9]/.test(pw)) score += 20;
    if (/[^A-Za-z0-9]/.test(pw)) score += 20;
    return Math.min(score, 100);
  }

  passwordStrengthColor(): string {
    const pct = this.passwordStrengthPct();
    if (pct < 40) return '#B5261E';
    if (pct < 70) return '#D4822A';
    return '#1E7A50';
  }

  passwordStrengthLabel(): string {
    const pct = this.passwordStrengthPct();
    if (pct < 40) return 'Weak';
    if (pct < 70) return 'Fair';
    if (pct < 90) return 'Good';
    return 'Strong';
  }

  async signInWithGoogle(): Promise<void> {
    this.googleLoading.set(true);
    this.submitError.set('');
    try {
      await this.auth.signInWithGoogle();
    } catch (err: any) {
      this.submitError.set(err?.message ?? 'Google sign-in failed. Please try again.');
      this.googleLoading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.submitError.set('');

    try {
      const { firstName, lastName, email, password } = this.form.value;
      const fullName = `${firstName} ${lastName}`.trim();
      await this.auth.register(fullName, email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.submitError.set(err?.message ?? 'Registration failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
