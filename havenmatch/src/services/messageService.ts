/**
 * HAVENMATCH AI — Message Service
 * Manages in-app chat messages between buyers and sellers.
 * Uses localStorage for persistence and syncs with backend when available.
 */

import { callAPI } from './api';
import { ChatMessage } from '../types';

const STORAGE_KEY = 'havenmatch_messages';

function loadFromStorage(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch { /* ignore */ }
}

class MessageService {
  private messages: ChatMessage[] = loadFromStorage();

  async getMessages(connectionId?: string): Promise<ChatMessage[]> {
    try {
      const data = await callAPI<{ success: boolean; messages: ChatMessage[] }>(
        'messages/list',
        { connectionId }
      );
      if (data.messages && data.messages.length > 0) {
        this.messages = data.messages;
        saveToStorage(this.messages);
      }
    } catch {
      // Use localStorage
    }
    return [...this.messages];
  }

  async sendMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    this.messages.push(newMsg);
    saveToStorage(this.messages);

    callAPI('messages/send', { message: newMsg }).catch(() => { /* ignore */ });

    return newMsg;
  }
}

export const messageService = new MessageService();
