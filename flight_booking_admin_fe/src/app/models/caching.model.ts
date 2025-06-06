import { HttpEvent } from "@angular/common/http";

export interface CacheEntry {
  data: HttpEvent<unknown>;
  expiresOn: number;
}
