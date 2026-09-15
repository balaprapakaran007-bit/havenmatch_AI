/**
 * HAVENMATCH AI — Visit Service
 * Manages property visit scheduling. Persists to localStorage for immediacy.
 */

import { callAPI } from './api';
import { Visit } from '../types';

const STORAGE_KEY = 'havenmatch_visits';

function loadFromStorage(): Visit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(visits: Visit[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  } catch { /* ignore */ }
}

class VisitService {
  private visits: Visit[] = loadFromStorage();

  async getVisits(userId?: string): Promise<Visit[]> {
    // Refresh from backend if available
    try {
      const data = await callAPI<{ success: boolean; visits: Visit[] }>('visits/list', { userId, sellerId: userId });
      if (data.visits && data.visits.length > 0) {
        this.visits = data.visits;
        saveToStorage(this.visits);
      }
    } catch {
      // Use localStorage version
    }
    return [...this.visits];
  }

  async scheduleVisit(visitData: Omit<Visit, 'id' | 'status' | 'createdAt'>): Promise<Visit> {
    const newVisit: Visit = {
      ...visitData,
      id: `vis-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    this.visits.unshift(newVisit);
    saveToStorage(this.visits);

    // Sync to backend
    callAPI('visits/schedule', { visitData: newVisit }).catch(() => { /* ignore */ });

    return newVisit;
  }

  async updateStatus(visitId: string, status: Visit['status']): Promise<Visit | null> {
    const idx = this.visits.findIndex(v => v.id === visitId);
    if (idx !== -1) {
      this.visits[idx] = { ...this.visits[idx], status };
      saveToStorage(this.visits);
      callAPI('visits/updateStatus', { visitId, status }).catch(() => { /* ignore */ });
      return this.visits[idx];
    }
    return null;
  }
}

export const visitService = new VisitService();
