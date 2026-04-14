import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseClientService } from '../services/supabase.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add auth header for requests to our own API
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const supabase = inject(SupabaseClientService);
  const token = supabase.getAccessToken();

  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(cloned);
};
