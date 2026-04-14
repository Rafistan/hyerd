import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private supabase: SupabaseClient;
  private _session$ = new BehaviorSubject<Session | null>(null);

  readonly session$: Observable<Session | null> = this._session$.asObservable();
  readonly user$: Observable<User | null> = this._session$.pipe(
    map((s) => s?.user ?? null),
  );

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

    // Restore session on app load
    this.supabase.auth.getSession().then(({ data }) => {
      this._session$.next(data.session);
    });

    // Keep session in sync with Supabase auth state
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  getAccessToken(): string | null {
    return this._session$.getValue()?.access_token ?? null;
  }
}
