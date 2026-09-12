/**
 * HAVENMATCH AI — Shortlist Service
 * Manages buyer property shortlists.
 * Persists to localStorage immediately (UX) and syncs to backend.
 */

import { callAPI } from './api';

const STORAGE_KEY = 'havenmatch_shortlist';

function loadFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

class ShortlistService {
  private shortlistedIds: string[] = loadFromStorage();

  getShortlistedIds(): string[] {
    return [...this.shortlistedIds];
  }

  isShortlisted(propertyId: string): boolean {
    return this.shortlistedIds.includes(propertyId);
  }

  async fetchShortlists(userId: string): Promise<string[]> {
    if (!userId) return this.shortlistedIds;
    try {
      const data = await callAPI<{ success: boolean; shortlists: Array<{ propertyId: string } | string> }>(
        'shortlists/list',
        { userId }
      );
      if (data?.shortlists && Array.isArray(data.shortlists)) {
        const ids = data.shortlists.map(item => typeof item === 'string' ? item : item.propertyId).filter(Boolean);
        this.shortlistedIds = ids;
        saveToStorage(this.shortlistedIds);
      }
    } catch {
      // Keep existing
    }
    return this.shortlistedIds;
  }

  async addToShortlist(userId: string, propertyId: string): Promise<void> {
    if (!this.shortlistedIds.includes(propertyId)) {
      this.shortlistedIds.push(propertyId);
      saveToStorage(this.shortlistedIds);
    }
    try {
      await callAPI('shortlists/add', { userId, propertyId });
    } catch { /* ignore */ }
  }

  async removeFromShortlist(userId: string, propertyId: string): Promise<void> {
    this.shortlistedIds = this.shortlistedIds.filter(id => id !== propertyId);
    saveToStorage(this.shortlistedIds);
    callAPI('shortlists/remove', { userId, propertyId }).catch(() => { /* ignore */ });
  }

  async toggle(userId: string, propertyId: string): Promise<boolean> {
    if (this.isShortlisted(propertyId)) {
      await this.removeFromShortlist(userId, propertyId);
      return false;
    } else {
      await this.addToShortlist(userId, propertyId);
      return true;
    }
  }
}

export const shortlistService = new ShortlistService();
