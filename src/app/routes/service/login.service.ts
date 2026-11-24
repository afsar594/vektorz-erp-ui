import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from '../domain';
import { ApiResponse } from '../domain/ApiResponse';
import { UserFile } from '../domain/UserFile';
import { auth } from './url.api';
import { LocalStorageService } from 'src/app/shared/service/storage.service';
import { CredentialKeys } from '../Enums/loginInfo';
import { BehaviorSubject } from 'rxjs';
import { PermissionsService } from 'src/app/shared/service/permissions.service';
import { Router } from '@angular/router';

const defaultUser: UserFile | null = null;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  public user$ = new BehaviorSubject<UserFile | null>(defaultUser);
  baseUrl: string = environment.apiRootURL;

  constructor(
    private httpClient: HttpClient,
    private storage: LocalStorageService,
    private _permission: PermissionsService,
    private router: Router
  ) {
    const data = this.storage.get(CredentialKeys.Login);
    if (data != null) {
      this.user$.next(data);
    }

    // 🔁 Sync across browser tabs
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === CredentialKeys.Login) {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        this.user$.next(newData);

        if (!newData) {
          // Auto-redirect to login on logout from another tab
          this.router.navigate(['/login']);
        }
      }
    });
  }

  public loginRequest(data1: User) {
    return this.httpClient.post<ApiResponse<UserFile>>(
      this.baseUrl + auth.authenticate,
      data1,
      httpOptions
    );
  }

  public setLogin(user: UserFile): void {
    this.storage.set(CredentialKeys.Login, user);
    this.user$.next(user);
  }

  public GetCredentialData(): UserFile | null {
    if (this._permission.getUser()) {
      return this._permission.getUser() as UserFile;
    } else {
      return null;
    }
  }
  refreshToken(data) {
    return this.httpClient.post<any>('refresh-token', { data });
  }
  public get IsValid(): boolean {
    return this.storage.get(CredentialKeys.Login) !== null;
  }

  public logout(): void {
    this.storage.remove(CredentialKeys.Login);
    this.user$.next(defaultUser);
    this.storage.clear();
    this.router.navigate(['/login']);
  }

  getRefreshToken(): string | null {
    return this.storage.get('refresh_token');
  }

  saveToken(token: string) {
    this.storage.set('token', token);
  }

  saveRefreshToken(refreshToken: string) {
    this.storage.set('refresh_token', refreshToken);
  }

  clearCredentials() {
    this.storage.clear();
  }
}
