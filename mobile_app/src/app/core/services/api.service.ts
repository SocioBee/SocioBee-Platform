import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class APIService {

    constructor(private http: HttpClient) { }

    public getUserCampaigns(data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/get_user_campaigns`, data);
    }

    public getAllDevices() {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_all_devices`);
    }

    public sendMeasurement(user_id: any, recommendation_id: any, campaign_id: any, data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/send_measurement/` + user_id + "/" + recommendation_id+ "/" + campaign_id, data);
    }

    public requestRecommendation(user_id: any, campaign_id: any, data: any) {
        return this.http.post<any>(`${environment.serverURL}/mveAPI/request_recommendations/` + user_id + "/" + campaign_id, data);
    }

    public changeRecommendationState(user_id: any, recommendation_id: any) {
        return this.http.get<any>(`${environment.serverURL}/mveAPI/change_recommendation_state/` + user_id + '/' + recommendation_id);
    }

    public assignDevice(user_id: any, device_name: any, campaign_id: any){
        return this.http.get<any>(`${environment.serverURL}/mveAPI/assign_devices/` + user_id + '/' + device_name + "/" + campaign_id);
    }

    public getNotifications() {
        return this.http.get<any>('/assets/data/notifications.json');
    }

}
