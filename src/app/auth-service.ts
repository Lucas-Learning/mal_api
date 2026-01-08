import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  setSessionId(sessionId: string) {
    sessionStorage.setItem('session_id', sessionId);
  }
  getSessionId(): string | null {
    return sessionStorage.getItem('session_id');
  }
}
