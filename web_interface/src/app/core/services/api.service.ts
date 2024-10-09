import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: "root" })
export class APIService {

    constructor(private http: HttpClient) { }

    public getCampaignStatus() {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_campaign_status`);
    }

    public getUserCampaigns(data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/get_user_campaigns`, data);
    }

    public getCampaign(campaign_id: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_campaign/` + campaign_id);
    }

    public getHive(hive_id: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_hive/` + hive_id);
    }

    public getHiveCampaigns(hive_id: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_hive_campaigns/` + hive_id);
    }
    
    public calculateMeasurementPoints(data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/calculate_measurement_points`, data);
    }

    public createCampaign(data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/create_campaign`, data);
    }

    public updateCampaign(data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/update_campaign`, data);
    }

    public upload(file: File, campaign_id: number){
        const formData: FormData = new FormData();
        formData.append('image', file);
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/upload_file/` + campaign_id, formData);
    }

    public getActiveCampaignsOverview(id: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_active_campaigns_overview/` + id);
    }

    public getCompletedCampaignsOverview(id: any, from_date: any, to_date: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_completed_campaigns_overview/` + id + "/" + from_date + "/" + to_date);
    }

    public getTrainingMaterials() {
        return this.http.get<any>('/assets/data/training_material.json');
    }

    public getUserHives(user_id: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_user_hives/` + user_id);
    }

    public getUserActiveHivesAsQueenBee(user_id: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_active_hives_as_queenbee/` + user_id);
    }

    public getAvailableBees() {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_available_bees`);
    }

    public createHive(data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/create_hive`, data);
    }

    public updateHive(data: any) {
        return this.http.post<any>(`${environment.serverURL}/acadeMeAPI/update_hive`, data);
    }


    public getWSNAirQualityExploreData(user_id: any,from: any, to: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_wsn_air_quality_explore_data/`+ user_id + "/"+ from +"/" + to);
    }

    public getHeatmapExploreData(from: any, to: any) {
        return this.http.get<any>(`${environment.serverURL}/acadeMeAPI/get_heatmap/`+ from +"/" + to);
    }

    public getAvailableCities() {
        return this.http.get<any>('/assets/data/available_cities.json');
    }



}
