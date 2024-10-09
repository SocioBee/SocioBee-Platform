import { HttpClient } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { environment } from "src/environments/environment";
import { Credentials } from "../models/Credentials";
import { UserToken } from "../models/UserToken";
import { Observable, of } from 'rxjs';
import { User } from "../models/User";
import { NewUser } from "../models/NewUser";

@Injectable({ providedIn: "root" })
export class AuthenticationService {
    constructor(private http: HttpClient) { }

    public login(model: Credentials) {
        return this.http.post<UserToken>(`${environment.serverURL}/authAPI/login`, model);
    }

    public register(model: any) {
        return this.http.post<UserToken>(`${environment.serverURL}/authAPI/register`, model);
    }


    public logout() {
        this.removeUserData();
        this.removeTokenData();
        return of(true);
    }


    public storeTokenData(data: any) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("expires_in", data.expires_in);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("token_type", data.token_type);

    }

    public storeUserData(user: User) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    public removeTokenData() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("expires_in");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_type");
    }

    public removeUserData() {
        localStorage.removeItem("user");
        // localStorage.removeItem("vehicle_id");
    }


    public isUserAuthenticated(): boolean {
        const access_token = this.getAccessToken();
        if (!access_token) return false;
        return true;
    }


    public getAccessToken() {
        try {
            return localStorage.getItem("access_token")
        } catch (err) {
            return ""
        }
    }

    public getUser() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    }

    public getRefreshToken() {
        try {
            return localStorage.getItem("refresh_token")
        } catch (err) {
          return ""
        }
      }
    
      public refreshToken(): Observable<UserToken> {
        return this.http.post<UserToken>(`${environment.serverURL}/authAPI/refresh-token`, {});
      } 
}
