import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Credentials } from '../models/Credentials';
import { NewUser } from '../models/NewUser';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private http: HttpClient) {}

  public login(model: Credentials) {
    return this.http.post<User>(`${environment.serverURL}/authAPI/login`, model);
  }

  public register(model: any) {
    return this.http.post<User>(`${environment.serverURL}/authAPI/register`, model);
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

  public storeUserData(user: any) {
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
    localStorage.removeItem("vehicle");
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
      return null
    }
  }

  public getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (err) {
      return null
    }
  }

  public getSelectedDevice() {
    try {
      return JSON.parse(localStorage.getItem('device') || null);
    } catch (err) {
      return null
    }
  }


  public setSelectedDevice(device: any) {
    localStorage.setItem("device", JSON.stringify(device));
  } 

  public getRefreshToken() {
    try {
      return localStorage.getItem("refresh_token")
    } catch (err) {
      return null
    }
  }

  public refreshToken(): Observable<User> {
    return this.http.post<User>(`${environment.serverURL}/authAPI/refresh-token`, {});
  } 

  public changePassword(data) {
    return this.http.post<any>(`${environment.serverURL}/authAPI/change-password`, data);
  } 




}
