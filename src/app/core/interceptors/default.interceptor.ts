import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';

import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  mergeMap,
  catchError,
  finalize,
  switchMap,
  filter,
  take,
} from 'rxjs/operators';
import {
  LoadingService,
  LoadingOverlayRef,
} from 'src/app/shared/service/loading.service';
import { LoginService } from 'src/app/routes/service/login.service';
import { Router } from '@angular/router';
/** Pass untouched request through to the next request handler. */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  constructor(
    private loadingService: LoadingService,
    private loginService: LoginService,
    private router: Router
  ) {}
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let loadingRef: LoadingOverlayRef;
    Promise.resolve(null).then(() => (loadingRef = this.loadingService.open()));

    const currentUser = this.loginService.GetCredentialData();

    if (req.headers.get('no-auth') === 'true') {
      return next.handle(req);
    }

    if (currentUser && currentUser.token != null) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${currentUser.token}` },
      });
    }

    return next.handle(req).pipe(
      mergeMap((event: any) => {
        if (event instanceof HttpResponse && loadingRef) {
          loadingRef.close();
        }
        return of(event);
      }),
      catchError((err: HttpErrorResponse) => {
        if (loadingRef) loadingRef.close();

        // Handle token expiration
        if (err.status === 401 && !req.url.includes('/refresh-token')) {
          return this.handle401Error(req, next);
        }

        const error = err.message || err.statusText;
        console.error('HTTP Error:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        if (loadingRef) loadingRef.close();
      })
    );
  }

  private handle401Error(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.loginService.getRefreshToken(); // 👈 create this getter in LoginService

      return this.loginService.refreshToken({ refreshToken }).pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;

          // Update stored credentials
          const newToken = res?.token;
          const newRefreshToken = res?.refreshToken;

          if (newToken) this.loginService.saveToken(newToken);
          if (newRefreshToken)
            this.loginService.saveRefreshToken(newRefreshToken);

          this.refreshTokenSubject.next(newToken);

          // Retry failed request
          return next.handle(
            req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            })
          );
        }),
        catchError((err) => {
          this.isRefreshing = false;
          console.error('Refresh token failed:', err);
          this.loginService.clearCredentials();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      // Wait if refresh is already in progress
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) =>
          next.handle(
            req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            })
          )
        )
      );
    }
  }
}
