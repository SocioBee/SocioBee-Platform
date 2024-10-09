import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: "root" })
export class MVEService {

    constructor(private http: HttpClient) { }

    public getMeasurementPoints(data: any) {
        return this.http.post<any>(`${environment.serverURL}/mveAPI/get_measurement_points`, data);
    }
}
