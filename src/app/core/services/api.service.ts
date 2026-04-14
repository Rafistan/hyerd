import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Category,
  CreateListingPayload,
  Listing,
  ListingQueryParams,
  ListingsResponse,
  ListingType,
  Profile,
} from '../models';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // ─── Listing Types ───────────────────────────────────
  getListingTypes(): Observable<ListingType[]> {
    return this.http.get<ListingType[]>(`${ this.apiUrl }/listing-types`);
  }

  getListingType(slug: string): Observable<ListingType> {
    return this.http.get<ListingType>(`${ this.apiUrl }/listing-types/${ slug }`);
  }

  // ─── Categories ──────────────────────────────────────
  getCategories(listingTypeSlug?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (listingTypeSlug) {
      params = params.set('listing_type_slug', listingTypeSlug);
    }
    return this.http.get<Category[]>(`${ this.apiUrl }/categories`, { params });
  }

  // ─── Listings (unified) ──────────────────────────────
  getListings(query?: ListingQueryParams): Observable<ListingsResponse> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params = params.set(k, String(v));
        }
      });
    }
    return this.http.get<ListingsResponse>(`${ this.apiUrl }/listings`, { params });
  }

  getListing(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${ this.apiUrl }/listings/${ id }`);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${ this.apiUrl }/listings/my`);
  }

  createListing(data: CreateListingPayload): Observable<Listing> {
    return this.http.post<Listing>(`${ this.apiUrl }/listings`, data);
  }

  updateListing(id: string, data: Partial<CreateListingPayload>): Observable<Listing> {
    return this.http.patch<Listing>(`${ this.apiUrl }/listings/${ id }`, data);
  }

  deleteListing(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${ this.apiUrl }/listings/${ id }`);
  }

  // ─── Users / Profiles ────────────────────────────────
  getMyProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${ this.apiUrl }/users/me`);
  }

  updateMyProfile(data: Partial<Profile>): Observable<Profile> {
    return this.http.patch<Profile>(`${ this.apiUrl }/users/me`, data);
  }

  getProfile(id: string): Observable<Profile> {
    return this.http.get<Profile>(`${ this.apiUrl }/users/${ id }`);
  }
}
