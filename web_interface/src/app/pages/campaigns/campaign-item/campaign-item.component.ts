import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { APIService } from 'src/app/core/services/api.service';
import { HelpersService } from 'src/app/core/services/helpers.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from "../../../../environments/environment"
import { AppToastService } from 'src/app/core/services/toast.service';
import { MVEService } from 'src/app/core/services/mve.service';

@Component({
  selector: 'app-campaign-item',
  templateUrl: './campaign-item.component.html',
  styleUrls: ['./campaign-item.component.scss']
})
export class CampaignItemComponent implements OnInit {

  emptyPointIcon = L.icon({ iconUrl: 'assets/images/empty.png', iconSize: [15, 15] });
  needMorePointIcon = L.icon({ iconUrl: 'assets/images/need_more.png', iconSize: [15, 15] });
  okPointIcon = L.icon({ iconUrl: 'assets/images/ok.png', iconSize: [15, 15] });

  init_coords: any = [40.566380, 22.997533]
  init_zoom: number = 15
  map!: L.Map;
  campaign_layer = new L.FeatureGroup();
  measurement_points_layer = new L.LayerGroup();
  selectedFiles?: FileList;

  readonly_campaign: boolean = false;

  minDate: any = null;
  datetime_range: any = null;

  campaign: any = {
    hive_id: null,
    status: "draft",
    thumbnail: null,
    title: null,
    start_datetime: "",
    end_datetime: "",
    description: null,
    city: null,
    address_district: null,
    postcode: null,
    latitude: null,
    longitude: null,
    radius: null,
    cells_distance: null,
    created_by: null,
    measurement_points: [],
    members: [],
    result: {
      participants: [],
      measurements_timeline: [],
      measurements_location: []
    }
  }

  all_hives = [];
  min_cells_distance: any = 0;
  radius_distance_analogy: any = 5;


  loading_run_engine: boolean = false;
  loading_manage_campaign: boolean = false;

  user: any


  options = {
    // responsive: false,
    // aspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  }

  constructor(
    private helpersService: HelpersService,
    private apiService: APIService,
    private authService: AuthenticationService,
    private dialogConfig: DynamicDialogConfig,
    private dialogRef: DynamicDialogRef,
    private toastService: AppToastService,
    private mveService: MVEService
  ) { }


  async ngOnInit(): Promise<void> {
    this.minDate = this.helpersService.getTimeAhead(0, 2);
    this.user = this.authService.getUser();
    if (this.dialogConfig.data.type == "edit") {

      this.campaign = await this.apiService.getCampaign(this.dialogConfig.data.campaign_id).toPromise();
      
      console.log(this.campaign)
      this.campaign.thumbnail = environment.serverURL + "/" + environment.apiName + "/" + this.campaign.campaign_id + "/" + this.campaign.thumbnail;
      this.datetime_range = [new Date(this.campaign.start_datetime), new Date(this.campaign.end_datetime)]
      if (this.campaign.status == 'declined' || this.campaign.status == 'completed' || this.campaign.status == 'active' || this.campaign.status == 'published') {
        this.readonly_campaign = true;
      } else {
        if (this.campaign.created_by == this.user.user_id) {
          this.readonly_campaign = false;
        } else {
          this.readonly_campaign = true;
        }
      }
      var campaign_center = [this.campaign.latitude, this.campaign.longitude]
      this.initializeLeafletMap(campaign_center)
      this.drawCampaign(this.campaign)
      this.drawMeasurementPoints();
      this.all_hives = await this.apiService.getUserActiveHivesAsQueenBee(this.campaign.created_by).toPromise();

    } else if (this.dialogConfig.data.type == "create") {
      this.readonly_campaign = false;
      this.initializeLeafletMap(this.init_coords)
      this.all_hives = await this.apiService.getUserActiveHivesAsQueenBee(this.user.user_id).toPromise();
      if (this.all_hives.length == 0) {
        this.toastService.errorMessage("You are not Queen Bee in any active hives")
        this.dialogRef.close();
      }

    }
  }

  initializeLeafletMap(center: any) {
    if (this.map == undefined) {
      this.map = L.map('campaign_map').setView(center, this.init_zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      var drawControl = new L.Control.Draw({
        draw: {
          circlemarker: false,
          polyline: false,
          rectangle: false,
          polygon: false,
          marker: false
        },
        edit: {
          featureGroup: this.campaign_layer,
          edit: false,
          remove: false
        }
      });
      if (!this.readonly_campaign) {
        this.map.addControl(drawControl);
      }
      this.map.addLayer(this.campaign_layer);
      this.map.on('draw:created', async (e) => {

        this.measurement_points_layer.clearLayers();
        this.campaign.measurement_points = []

        this.campaign_layer.clearLayers();

        this.getAreaMetadata(e.layer)
        this.campaign_layer.addLayer(e.layer);
      });
      this.map.addLayer(this.measurement_points_layer)
    }
  }

  drawCampaign(selected_campaign: any) {
    // Draw the campaign area on map
    const radius = selected_campaign.radius; // radius in meters
    const center = L.latLng(selected_campaign.latitude, selected_campaign.longitude);
    const circle = L.circle(center, {
      weight: 4,
      radius: radius,
      color: '#3388ff',
      opacity: 0.5,

      fillColor: '#3388ff',
      fillOpacity: 0.2
    })
    this.campaign_layer.addLayer(circle);
  }

  async getAreaMetadata(area: any) {
    let geolocation = await this.helpersService.reverseGeolocation(area._latlng.lat, area._latlng.lng).toPromise();
    this.campaign.latitude = area._latlng.lat.toFixed(6)
    this.campaign.longitude = area._latlng.lng.toFixed(6)
    this.campaign.radius = parseInt(area._mRadius)
    this.min_cells_distance = Math.round(this.campaign.radius / this.radius_distance_analogy)
    this.campaign.cells_distance = this.min_cells_distance
    this.campaign.city = geolocation.address.city ? geolocation.address.city : ""
    if (geolocation.address.road && geolocation.address.neighbourhood && geolocation.address.house_number) {
      this.campaign.address_district = geolocation.address.road + " " + geolocation.address.house_number + ", " + geolocation.address.neighbourhood
    } else {
      this.campaign.address_district = geolocation.address.city_district
    }
    this.campaign.postcode = geolocation.address.postcode.replaceAll(" ", "")

  }

  onFileChanged(event: any) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles && this.selectedFiles[0]) {

      const reader = new FileReader();
      reader.onload = e => this.campaign.thumbnail = reader.result;

      reader.readAsDataURL(this.selectedFiles[0]);
    }
  }

  async manageCampaign(status: String) {
    let temp_campaign = JSON.parse(JSON.stringify(this.campaign));
    temp_campaign.start_datetime = this.datetime_range[0].getTime()
    temp_campaign.end_datetime = this.datetime_range[1].getTime();
    if (this.checkCampaignData(temp_campaign, status)) {
      this.loading_manage_campaign = true;
      temp_campaign.start_datetime = this.datetime_range[0].getTime()
      temp_campaign.end_datetime = this.datetime_range[1].getTime();
      temp_campaign.created_by = this.user.user_id
      temp_campaign.status = status
      temp_campaign.thumbnail = ""

      if (temp_campaign.campaign_id) {
        temp_campaign = await this.apiService.updateCampaign(temp_campaign).toPromise();
        temp_campaign["thumbnail"] = environment.serverURL + "/" + environment.apiName + "/" + temp_campaign["campaign_id"] + "/" + temp_campaign["thumbnail"];
      } else {
        temp_campaign = await this.apiService.createCampaign(temp_campaign).toPromise();
      }

      if (this.selectedFiles && temp_campaign.campaign_id) {
        let upload_result = await this.apiService.upload(this.selectedFiles[0], temp_campaign.campaign_id).toPromise();
        if (upload_result["success"]) {
          temp_campaign["thumbnail"] = environment.serverURL + "/" + environment.apiName + "/" + temp_campaign["campaign_id"] + "/" + upload_result["thumbnail"];
        }

      }

      this.loading_manage_campaign = false;
      this.dialogRef.close(temp_campaign);
    }

  }

  declineCampaign(): void {

  }

  async calculateMeasurementPoints(): Promise<void> {
    this.loading_run_engine = true;
    if (this.campaign.latitude != null && this.campaign.longitude != null) {
      let data = {
        'centre': {
          'Latitude': this.campaign.latitude,
          'Longitude': this.campaign.longitude
        },
        'radius': this.campaign.radius,
        'cells_distance': this.campaign.cells_distance
      }
      this.campaign.measurement_points = await this.mveService.getMeasurementPoints(data).toPromise();
      this.loading_run_engine = false;
      this.drawMeasurementPoints();
    } else {
      this.loading_run_engine = false;
      this.toastService.errorMessage("Please use the map to select the area of the campaign")
    }
  }

  drawMeasurementPoints() {
    this.loading_run_engine = true;
    this.measurement_points_layer.clearLayers();
    this.campaign.measurement_points.forEach((item: any) => {
      // if (this.campaign.result){
        let tmp_idx = this.campaign.result.measurements_location.findIndex((element: any) => element.lat == item.Latitude && element.lon == item.Longitude);
        if (tmp_idx > -1) {
          if (this.campaign.result.measurements_location[tmp_idx].values.length >= 3){
            let marker = L.marker([item.Latitude, item.Longitude], { icon: this.okPointIcon })
            marker.bindPopup(this.campaign.result.measurements_location[tmp_idx].values.length + "");
            this.measurement_points_layer.addLayer(marker)
          }else if (this.campaign.result.measurements_location[tmp_idx].values.length < 3 && this.campaign.result.measurements_location[tmp_idx].values.length >= 1){
            let marker = L.marker([item.Latitude, item.Longitude], { icon: this.needMorePointIcon })
            marker.bindPopup(this.campaign.result.measurements_location[tmp_idx].values.length + "");
            this.measurement_points_layer.addLayer(marker)
          }
        } else {
          let marker = L.marker([item.Latitude, item.Longitude], { icon: this.emptyPointIcon }).bindPopup("0");
          this.measurement_points_layer.addLayer(marker)
        }
      // } else {
      //   let marker = L.marker([item.Latitude, item.Longitude], { icon: this.emptyPointIcon }).bindPopup(item.Latitude + ', ' + item.Longitude);
      //   this.measurement_points_layer.addLayer(marker)
      // }
      

    })
    this.loading_run_engine = false;
  }

  checkCampaignData(new_campaign: any, status: any) {

    if (status == "published") {
      if (new Date().getTime() > new_campaign.start_datetime) {
        this.toastService.errorMessage("Please change the start date time because it is in the past!")
        return false
      }
    }

    if (new_campaign.title == null) {
      this.toastService.errorMessage("Please fill in the Title field")
      return false
    }

    if (new_campaign.description == null) {
      this.toastService.errorMessage("Please fill in the Description field")
      return false
    }

    if (new_campaign.thumbnail == null) {
      this.toastService.errorMessage("Please select an image for campaign thumbnail")
      return false
    }

    if (this.datetime_range == null) {
      this.toastService.errorMessage("Please select a date range for the campaign")
      return false
    }

    if (new_campaign.hive_id == null) {
      this.toastService.errorMessage("Please select the hive that will run the campaign")
      return false
    }

    if (new_campaign.latitude == null || new_campaign.longitude == null || new_campaign.radius == null) {
      this.toastService.errorMessage("Please use the map to select the area of the campaign")
      return false
    }

    if (new_campaign.city == null) {
      this.toastService.errorMessage("Please fill in the City field")
      return false
    }

    if (new_campaign.address_district == null) {
      this.toastService.errorMessage("Please fill in the Address/District field")
      return false
    }

    if (new_campaign.postcode == null) {
      this.toastService.errorMessage("Please fill in the Postcode field")
      return false
    }


    if (new_campaign.measurement_points.length == 0) {
      this.toastService.errorMessage("Please Run engine to generate measurement points")
      return false
    }

    return true
  }
}