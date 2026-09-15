import { Injectable } from '@nestjs/common';
import type { PopularSector } from '@underscore/shared';

export interface PopularSectorSnapshot {
  checkedDate: string;
  baseDate: string;
  sectors: PopularSector[];
}

@Injectable()
export class PopularSectorCache {
  private snapshot: PopularSectorSnapshot | null = null;

  get(checkedDate: string): PopularSectorSnapshot | null {
    return this.snapshot?.checkedDate === checkedDate ? this.snapshot : null;
  }

  getLatest(): PopularSectorSnapshot | null {
    return this.snapshot;
  }

  set(snapshot: PopularSectorSnapshot): void {
    this.snapshot = snapshot;
  }
}
