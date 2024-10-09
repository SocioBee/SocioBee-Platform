import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private authService: AuthService,
        private alertCtrl: AlertController
    ) { }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = null
        let authReq = req;
        if (authReq.url.includes('authAPI/refresh-token')) {
            token = this.authService.getRefreshToken()
        } else {
            token = this.authService.getAccessToken()
        }
        if (token != null) {
            authReq = this.addTokenHeader(req, token);
        }

        return next.handle(authReq).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && !authReq.url.includes('authAPI/login') && error.status === 401) {
                return this.handle401Error(authReq, next);
            }else{
                this.showServerErrorAlert()
            }
            return throwError(error);
        }));
    }

    private async showServerErrorAlert() {
        const alert = await this.alertCtrl.create({
          "header": "Something went wrong",
          "message": "Please check your internet connection or inform platform admin!",
          "backdropDismiss": false,
          "buttons": [
            {
              text: "OK",
              handler: () => {
                App.exitApp();
              }
            }
          ]
        });
    
        await alert.present();
      }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {

        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);
            return this.authService.refreshToken().pipe(
                switchMap((data: any) => {
                    this.isRefreshing = false;
                    this.authService.storeTokenData(data);
                    this.refreshTokenSubject.next(data.access_token);

                    return next.handle(this.addTokenHeader(request, data.access_token));
                }),
                catchError((err) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    return throwError(err);
                })
            );

        }
    }


    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({ headers: request.headers.set("Authorization", 'Bearer ' + token) });
    }


    private tokenExpired(token: string) {
        const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }

}