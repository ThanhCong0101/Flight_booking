import { HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheEntry } from '../models/caching.model';

@Injectable({
  providedIn: 'root',
})
export class CachingService {
  private readonly keywordTTL = new Map<string, number>([
    ['auto-complete', 60 * 60 * 1000], //1 hour
    ['search/one-way', 5 * 60 * 1000], //5 minutes
    ['search/round-trip', 5 * 60 * 1000], //5 minutes
    ['detail', 5 * 60 * 1000], //5 minutes
    ['flightsItinerary', 5 * 60 * 1000], //5 minutes
    ['flights/search/price', 5 * 60 * 1000], //5 minutes
  ]);
  constructor() {}

  readonly #cache = new Map<string, CacheEntry>();

  private getRandomizedTTL(baseTTL: number): number {
    // Add/subtract up to 10% of the base TTL
    const variance = baseTTL * 0.1;
    const randomOffset = Math.random() * variance * 2 - variance;
    return baseTTL + randomOffset;
  }

  get(key: string): HttpEvent<unknown> | undefined {
    const cached = this.#cache.get(key);

    if (!cached) {
      return undefined;
    }

    // 👇 Remove the entry if expired
    const hasExpired = new Date().getTime() >= cached.expiresOn;
    if (hasExpired) {
      this.#cache.delete(key);
      return undefined;
    }

    return cached.data;
  }

  set(key: string, data: HttpEvent<unknown>): void {
    // Add TTL for some chaning data
    for (const [keyword, ttl] of this.keywordTTL) {
      if (key.includes(keyword)) {
        const randomizedTTL = this.getRandomizedTTL(ttl);
        this.#cache.set(key, {
          data,
          // 👇 Set its lifespan
          expiresOn: new Date().getTime() + randomizedTTL,
        });
        return;
      }
    }
  }
}
