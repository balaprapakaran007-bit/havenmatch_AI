/**
 * HAVENMATCH AI — Interest Service
 * Buyer expresses interest in a property. Seller can see and respond.
 */

import { callAPI } from './api';

const STORAGE_KEY = 'havenmatch_interests';

interface InterestRecord {
  interestId: string;
  propertyId: string;
  buyerId: string;
  status: 'expressed' | 'accepted' | 'rejected';
  timestamp: string;
}

function loadFromStorage(): InterestRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records: InterestRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch { /* ignore */ }
}

class InterestService {
  private records: InterestRecord[] = loadFromStorage();

  hasExpressedInterest(propertyId: string): boolean {
    return this.records.some(r => r.propertyId === propertyId && r.status !== 'rejected');
  }

  async expressInterest(buyerId: string, propertyId: string): Promise<string> {
    const existing = this.records.find(r => r.propertyId === propertyId && r.buyerId === buyerId);
    if (existing) return existing.interestId;

    const localRecord: InterestRecord = {
      interestId: `int-${Date.now()}`,
      propertyId,
      buyerId,
      status: 'expressed',
      timestamp: new Date().toISOString(),
    };
    this.records.push(localRecord);
    saveToStorage(this.records);

    try {
      const data = await callAPI<{ success: boolean; interestId: string }>(
        'interests/express',
        { buyerId, propertyId }
      );
      if (data.interestId) localRecord.interestId = data.interestId;
    } catch {
      // localStorage saves the intent even if backend is down
    }

    return localRecord.interestId;
  }

  getMyInterests(): InterestRecord[] {
    return [...this.records];
  }
}

export const interestService = new InterestService();
