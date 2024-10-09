import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class MainInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthenticationService
    ) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token: any = ""
        let authReq = request;
        if (authReq.url.includes('authAPI/refresh-token')) {
            token = this.authService.getRefreshToken()
        } else {
            token = this.authService.getAccessToken()
        }
        if (token != null) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ` + token
                }
            });
        }
        return next.handle(request);
    }
}
