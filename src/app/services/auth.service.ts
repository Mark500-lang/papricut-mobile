import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private storage: Storage) {}

  // Called once on app start
  async initializeAuth(): Promise<void> {
    await this.storage.create(); // Ensure storage is ready
    const storedAuth = await this.storage.get('isAuthenticated');
    const token = await this.storage.get('authToken');
    const isAuth = storedAuth === true && !!token;
    this.isAuthenticatedSubject.next(isAuth);
  }

  // Helper for raw boolean value
  async getIsAuthenticatedValue(): Promise<boolean> {
    const storedAuth = await this.storage.get('isAuthenticated');
    const token = await this.storage.get('authToken');
    return storedAuth === true && !!token;
  }

  // Token handling
  async setAuthToken(token: string): Promise<void> {
    this.setAuthenticated();
    return this.storage.set('authToken', token); // save to Ionic Storage
  }

  getAuthToken(): Promise<string | null> {
    return this.storage.get('authToken');
  }

  // Mark as logged in
  async setAuthenticated(): Promise<void> {
    await this.storage.set('isAuthenticated', true);
    this.isAuthenticatedSubject.next(true);
  }

  // Mark as logged out
  async clearAuthentication(): Promise<void> {
    await this.storage.remove('authToken');
    await this.storage.set('isAuthenticated', false);
    this.isAuthenticatedSubject.next(false);
  }

  // For reactive usage
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
}
