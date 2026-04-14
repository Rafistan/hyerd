import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>(this.getStoredTheme());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      const t = this._theme();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('hy-theme', t);
    });
  }

  toggle(): void {
    this._theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }

  set(theme: Theme): void {
    this._theme.set(theme);
  }

  private getStoredTheme(): Theme {
    try {
      const stored = localStorage.getItem('hy-theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  }
}
