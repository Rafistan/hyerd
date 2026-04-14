import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseClientService);
  private router = inject(Router);

  readonly currentUser$: Observable<User | null> = this.supabase.user$;
  readonly session$ = this.supabase.session$;

  isLoggedIn(): boolean {
    return this.supabase.getAccessToken() !== null;
  }

  async login(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async register(fullName: string, email: string, password: string): Promise<void> {
    const { error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  }

  async logout(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.router.navigate(['/']);
  }

}
