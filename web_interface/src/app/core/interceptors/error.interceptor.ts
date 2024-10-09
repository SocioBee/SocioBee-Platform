import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient } from '@angular/common/http';
import { Observable, throwError, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
    providedIn: 'root'
  })
export class ErrorInterceptor implements HttpInterceptor {

    private static accessTokenError$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private authService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            
            if (err.status === 401) {

                if (!ErrorInterceptor.accessTokenError$.getValue()) {

                    ErrorInterceptor.accessTokenError$.next(true);

                    // Call API and get a New Access Token
                    return this.authService.refreshToken().pipe(
                        switchMap((data: any) => {
                            // Save new Tokens
                            this.authService.storeTokenData(data);

                            ErrorInterceptor.accessTokenError$.next(false);
                            // Clone the request with new Access Token
                            const newRequest = request.clone({
                                setHeaders: {
                                    Authorization: `Bearer ` + this.authService.getAccessToken()
                                }
                            });
                            return next.handle(newRequest);
                        }),
                        catchError(er => {
                            localStorage.clear();
                            location.reload();
                            return throwError(er);
                        })
                    );
                } else {

                    // If it's not the firt error, it has to wait until get the access/refresh token
                    return this.waitNewTokens().pipe(
                        switchMap((event: any) => {
                            // Clone the request with new Access Token
                            const newRequest = request.clone({
                                setHeaders: {
                                    Authorization: `Bearer ` + this.authService.getAccessToken()
                                }
                            });
                            return next.handle(newRequest);
                        })
                    );
                }
            } else if (err.status === 403) {
                // Logout if 403 response - Refresh Token invalid
                localStorage.clear();
                location.reload();
            }

            // You can return the Object "err" if you want to.
            const error = err.error.message || err.statusText;

            return throwError(error);
        }));
    }

    // Wait until get the new access/refresh token
    private waitNewTokens(): Observable<any> {
        const subject = new Subject<any>();
        const waitToken$: Subscription = ErrorInterceptor.accessTokenError$.subscribe((error: boolean) => {
            if(!error) {
                subject.next();
                waitToken$.unsubscribe();
            }
        });
        return subject.asObservable();
    }

}