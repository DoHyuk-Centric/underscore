import { Injectable } from '@nestjs/common';
import type { PopularStock } from '@underscore/shared';

export interface PopularSectorSnapshot {
  checkedDate: string;
  baseDate: string;
  stocks: PopularStock[];
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
