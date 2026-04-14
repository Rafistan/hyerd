import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout">

      <!-- Left Panel: Visual -->
      <div class="auth-panel-visual" aria-hidden="true">
        <div class="visual-bg">
          <div class="visual-blob v-blob1"></div>
          <div class="visual-blob v-blob2"></div>
          <div class="visual-grid"></div>
        </div>
        <div class="visual-content">
          <div class="visual-logo">
            <span class="vl-pom">
              <span class="pom-b"></span>
              <span class="pom-c"><span></span><span></span><span></span></span>
            </span>
            <span class="vl-name">Hyerd</span>
          </div>
          <blockquote class="visual-quote">
            "The best way to connect with the Armenian community — wherever you are in the world."
          </blockquote>
          <div class="visual-stats">
            <div class="vs-item">
              <span class="vs-val">50K+</span>
              <span class="vs-lbl">Members</span>
            </div>
            <div class="vs-divider"></div>
            <div class="vs-item">
              <span class="vs-val">12K+</span>
              <span class="vs-lbl">Businesses</span>
            </div>
            <div class="vs-divider"></div>
            <div class="vs-item">
              <span class="vs-val">5K+</span>
              <span class="vs-lbl">Jobs</span>
            </div>
          </div>
        </div>
        <div class="visual-pattern"></div>
      </div>

      <!-- Right Panel: Form -->
      <div class="auth-panel-form">
        <div class="auth-form-wrap">

          <div class="auth-header">
            <h1 class="auth-heading">Welcome back</h1>
            <p class="auth-subheading">Sign in to your Hyerd account to continue.</p>
          </div>

          <!-- Social logins -->
          <div class="social-btns">
            <button type="button" class="social-btn" (click)="signInWithGoogle()" [disabled]="googleLoading()">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" class="social-btn">
              <i class="bi bi-facebook" style="color:#1877F2;font-size:18px"></i>
              Continue with Facebook
            </button>
          </div>

          <div class="auth-divider">
            <span>or sign in with email</span>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form" novalidate>

            <div class="field-group">
              <label for="email" class="field-label">Email Address</label>
              <div class="field-wrap" [class.has-error]="showError('email')">
                <i class="bi bi-envelope field-icon"></i>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  formControlName="email"
                  class="field-input"
                  autocomplete="email"
                />
              </div>
              @if (showError('email')) {
                <span class="field-error"><i class="bi bi-exclamation-circle"></i> Enter a valid email</span>
              }
            </div>

            <div class="field-group">
              <div class="label-row">
                <label for="password" class="field-label">Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <div class="field-wrap" [class.has-error]="showError('password')">
                <i class="bi bi-lock field-icon"></i>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  placeholder="Your password"
                  formControlName="password"
                  class="field-input"
                  autocomplete="current-password"
                />
                <button type="button" class="toggle-pw" (click)="showPassword.set(!showPassword())">
                  <i [class]="showPassword() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              @if (showError('password')) {
                <span class="field-error"><i class="bi bi-exclamation-circle"></i> Password is required</span>
              }
            </div>

            <label class="remember-row">
              <input type="checkbox" formControlName="rememberMe" class="remember-check" />
              <span>Remember me for 30 days</span>
            </label>

            @if (submitError()) {
              <div class="form-error-banner">
                <i class="bi bi-exclamation-triangle-fill"></i>
                {{ submitError() }}
              </div>
            }

            <button type="submit" class="btn-hy btn-hy-primary auth-submit" [disabled]="loading()">
              @if (loading()) {
                <span class="spin"></span>
                Signing in…
              } @else {
                Sign In
                <i class="bi bi-arrow-right"></i>
              }
            </button>
          </form>

          <p class="auth-switch">
            Don't have an account?
            <a routerLink="/register" class="auth-switch-link">Create one free</a>
          </p>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

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

    .visual-bg {
      position: absolute;
      inset: 0;
    }

    .visual-blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
    }

    .v-blob1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #B5261E, transparent 70%);
      top: -150px;
      right: -100px;
    }

    .v-blob2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #1A4FA0, transparent 70%);
      bottom: -100px;
      left: -80px;
      opacity: 0.2;
    }

    .visual-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .visual-pattern {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
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
      margin-bottom: 40px;
    }

    .vl-pom {
      position: relative;
      width: 28px;
      height: 32px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .pom-b {
      position: absolute;
      bottom: 0;
      width: 26px;
      height: 24px;
      background: var(--hy-gradient-warm);
      border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%;
      box-shadow: 0 4px 14px rgba(181, 38, 30, 0.5);
    }

    .pom-c {
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
        &:nth-child(1) { height: 5px; }
        &:nth-child(2) { height: 8px; }
        &:nth-child(3) { height: 5px; }
      }
    }

    .vl-name {
      font-family: var(--hy-font-display);
      font-size: 1.8rem;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.04em;
    }

    .visual-quote {
      font-family: var(--hy-font-display);
      font-size: 1.55rem;
      font-weight: 500;
      font-style: italic;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.4;
      margin-bottom: 48px;
      max-width: 380px;
      border-left: 3px solid var(--hy-pomegranate);
      padding-left: 20px;
    }

    .visual-stats {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .vs-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .vs-val {
      font-family: var(--hy-font-display);
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
    }

    .vs-lbl {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .vs-divider {
      width: 1px;
      height: 36px;
      background: rgba(255, 255, 255, 0.12);
    }

    // ---- Form Panel ----
    .auth-panel-form {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--hy-bg);
      padding: 48px 24px;
      min-height: 100vh;

      @media (max-width: 900px) {
        min-height: auto;
        padding: 40px 16px;
      }
    }

    .auth-form-wrap {
      width: 100%;
      max-width: 420px;
    }

    .auth-header {
      margin-bottom: 28px;
    }

    .auth-heading {
      font-family: var(--hy-font-display);
      font-size: 2rem;
      font-weight: 800;
      color: var(--hy-midnight);
      margin-bottom: 8px;
      letter-spacing: -0.03em;

      [data-theme="dark"] & {
        color: var(--hy-text);
      }
    }

    .auth-subheading {
      font-size: 0.92rem;
      color: var(--hy-text-secondary);
      margin: 0;
    }

    // Social buttons
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
        background: rgba(181, 38, 30, 0.03);
      }
    }

    // Divider
    .auth-divider {
      position: relative;
      text-align: center;
      margin: 20px 0;
      font-size: 0.8rem;
      color: var(--hy-text-muted);

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
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

    // Form fields
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
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

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 0.8rem;
      color: var(--hy-pomegranate);
      font-weight: 500;

      &:hover {
        color: var(--hy-pomegranate-dark);
      }
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
        box-shadow: 0 0 0 3px rgba(181, 38, 30, 0.1);
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

      &::placeholder {
        color: var(--hy-text-muted);
      }
    }

    .toggle-pw {
      padding: 0 14px;
      border: none;
      background: transparent;
      color: var(--hy-text-muted);
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color 0.2s;

      &:hover {
        color: var(--hy-text);
      }
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

    .remember-row {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 0.85rem;
      color: var(--hy-text-secondary);
      cursor: pointer;
    }

    .remember-check {
      width: 16px;
      height: 16px;
      accent-color: var(--hy-pomegranate);
      cursor: pointer;
      flex-shrink: 0;
    }

    .form-error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--hy-error-bg);
      color: var(--hy-pomegranate);
      border-radius: var(--hy-radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid rgba(181, 38, 30, 0.2);

      i { flex-shrink: 0; }
    }

    .auth-submit {
      width: 100%;
      padding: 14px;
      font-size: 0.95rem;
      border-radius: var(--hy-radius-sm);
      gap: 8px;
      margin-top: 4px;

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .spin {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: hy-spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    @keyframes hy-spin {
      to { transform: rotate(360deg); }
    }

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

      &:hover {
        color: var(--hy-pomegranate-dark);
      }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  loading = signal(false);
  googleLoading = signal(false);
  submitError = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  showError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control.dirty || control.touched));
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
      const { email, password } = this.form.value;
      await this.auth.login(email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.submitError.set(err?.message ?? 'Login failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
