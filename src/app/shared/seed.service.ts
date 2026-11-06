import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Seed } from './seed';

const DEFAULT_SEASONS = ['2025/26 Temprana', '2025/26 Tardía'];

@Injectable({
  providedIn: 'root'
})
export class SeedService {

  private readonly apiUrl = 'http://localhost:3000/seeds';

  constructor(private readonly http: HttpClient) { }

  getSeeds(): Observable<Seed[]> {
    return this.http.get<Seed[]>(this.apiUrl).pipe(
      map(seeds => seeds.map(seed => this.withDefaultSeasons(seed)))
    );
  }

  getAdminCatalog(): Observable<Seed[]> {
    return this.http.get<Seed[]>(`${this.apiUrl}/catalog`).pipe(
      map(seeds => seeds.map(seed => this.withDefaultSeasons(seed)))
    );
  }

  getSeedById(id: string): Observable<Seed> {
    return this.http.get<Seed>(`${this.apiUrl}/${id}`).pipe(
      map(seed => this.withDefaultSeasons(seed))
    );
  }

  createSeed(seed: Partial<Seed>): Observable<Seed> {
    return this.http.post<Seed>(this.apiUrl, seed);
  }

  updateSeed(id: string, seed: Partial<Seed>): Observable<Seed> {
    return this.http.put<Seed>(`${this.apiUrl}/${id}`, seed);
  }

  deleteSeed(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private withDefaultSeasons(seed: Seed): Seed {
    return {
      ...seed,
      availableSeasons: seed.availableSeasons?.length
        ? seed.availableSeasons
        : DEFAULT_SEASONS
    };
  }
}
