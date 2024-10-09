import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common'
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import * as L from 'leaflet';
import { LocationService } from 'src/app/core/services/location.service';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { IonSelect } from '@ionic/angular';
import { APIService } from 'src/app/core/services/api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { MeasurementComponent } from 'src/app/core/components/measurement/measurement.component';
import { BleClient, ScanResult, numberToUUID } from '@capacitor-community/bluetooth-le';

@Component({
  selector: 'app-selected-campaign',
  templateUrl: './selected-campaign.component.html',
  styleUrls: ['./selected-campaign.component.scss'],
})
export class SelectedCampaignComponent implements OnInit {
  campaign: any;
  init_zoom: number = 14
  map: L.Map;
  user: any;
  campaign_layer = new L.FeatureGroup();
  position_layer = new L.FeatureGroup();
  measurement_points_layer = new L.FeatureGroup();

  positionIcon = L.icon({ iconUrl: 'assets/images/markers/current.gif', iconSize: [35, 35] });
  recommendationPointIcon = L.icon({ iconUrl: 'assets/images/markers/point.png', iconSize: [35, 35] });
  measurementPointIcon = L.icon({ iconUrl: 'assets/images/markers/point2.png', iconSize: [35, 35] });

  recommendations: any = [];
  current_location: any = {};

  showVoluneerAbort: boolean = false;

  selected_recommendation: any = null
  measurement_modal_is_closed: boolean = true;

  available_device_list: any = [];

  max_distance = 40;
  
  @ViewChild('deviceSelect') selectRef: IonSelect;
  constructor(
    private router: Router,
    private location: Location,
    private translateService: TranslateService,
    private locationService: LocationService,
    private modalCtrl: ModalController,
    private apiService: APIService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private helpService: HelperService

  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.use(event.lang);
    });
  }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.campaign = this.router.getCurrentNavigation().extras.state;
    console.log(this.campaign)
    this.initializeLeafletMap()

  }

  initializeLeafletMap() {
    if (this.map == undefined) {
      this.map = L.map('campaignMapArea', { maxZoom: 25 })
        .on('load', (e: any) => setTimeout(() => { this.map.invalidateSize(); }, 100))
        .setView([this.campaign.latitude, this.campaign.longitude], this.init_zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      this.map.addLayer(this.campaign_layer);
      this.map.addLayer(this.position_layer);
      this.map.addLayer(this.measurement_points_layer);
      this.drawCampaign();
      this.updateCurrentLocationMarker();
    }
    this.openMeasurementModal()

  }

  drawCampaign() {
    // Draw the campaign area on map
    const radius = this.campaign.radius; // radius in meters
    const center = L.latLng(this.campaign.latitude, this.campaign.longitude);
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

  updateCurrentLocationMarker() {
    this.locationService.getCurrentPosition().subscribe((data: any) => {
      if (data != null) {
        if (data["coords"]) {
          this.position_layer.clearLayers();
          this.current_location = data["coords"]
          let marker = L.marker([this.current_location["latitude"], this.current_location["longitude"]], { icon: this.positionIcon });
          this.position_layer.addLayer(marker)
          if (this.selected_recommendation != null && this.measurement_modal_is_closed){
            let remaining_distance = this.calculateDistance(this.selected_recommendation.cell.centre.Latitude, this.selected_recommendation.cell.centre.Longitude, this.current_location["latitude"], this.current_location["longitude"])
            if (remaining_distance < this.max_distance ){
              this.measurement_modal_is_closed = false
              this.openMeasurementModal()
            }
            console.log(remaining_distance)
          }
        }
      }
    })
  }

  centralizeMap() {
    // this.map.flyTo({ center: this.currentLatLng, essential: true });
  }

  async checkIfHasConnectedDevice() {
    try {
      this.available_device_list = await this.apiService.getAllDevices().toPromise();
      await BleClient.initialize();
      let connected_device_list = await BleClient.getConnectedDevices([]);
      console.log("connected_device_list: ", connected_device_list)

      let my_device = null;
      for (var i = 0; i < connected_device_list.length; i++) {
        for (var j = 0; j < this.available_device_list.length; j++) {
          if (connected_device_list[i]["name"] == "WSN_" + this.available_device_list[j]["name"]) {
            my_device = this.available_device_list[j]
            break;
          }
        }
      }
      if (my_device != null) {
        this.requestRecommendation()
      } else {
        this.onNoDeviceConnected()
      }
    } catch (error) {
      console.error('scanForDevice', error);
      return null
    }

  }

  async requestRecommendation() {
    this.showVoluneerAbort = true;
    let loading = await this.loadingController.create({spinner: "circles", message: 'Please wait...',});
    await loading.present();

    let data = {
      "member_current_location": {
        "Longitude": this.current_location.longitude,
        "Latitude": this.current_location.latitude
      },
      "sent_datetime": new Date().toISOString().split(".")[0]
    }
    let response = await this.apiService.requestRecommendation(this.user["user_id"], this.campaign["campaign_id"], data).toPromise();
    if (response.results) {
      this.recommendations = response.results
      console.log(this.recommendations)
      let self = this;
      this.recommendations.forEach((item: any) => {
        let marker = L.marker([item.cell.centre.Latitude, item.cell.centre.Longitude], { icon: this.recommendationPointIcon })
          .on('mouseover', function (e) {
            self.onRecommendationClick(item);
          });
        this.measurement_points_layer.addLayer(marker)
      })
      this.showAlert(this.translateService.instant('general.recommenations'),  this.translateService.instant('general.select_point'))
    } else if (response.detail) {
      this.showVoluneerAbort = false;
      console.log(response.detail)
      this.showAlert(this.translateService.instant('general.recommenations'), this.translateService.instant('general.' + response.detail))
    }

    await loading.dismiss();
    
  }

  async onRecommendationClick(recommendation: any){
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: this.translateService.instant('general.measurement_point'),
      message: this.translateService.instant('general.go_to_meas_point'),
      buttons: [
        {
          text: this.translateService.instant('general.cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: this.translateService.instant('general.ok'),
          handler: async () => {
            this.changeRecommendationState(recommendation)

          },
        },
      ],
    });

    await alert.present();
    
  }

  async onNoDeviceConnected(){
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: this.translateService.instant('general.connected_device'),
      message: this.translateService.instant('general.no_connected_device'),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {},
        },
        {
          text: 'OK',
          handler: async () => {
            this.router.navigate(["tabs/profile"], {state: this.campaign});

          },
        },
      ],
    });

    await alert.present();
    
  }

  async changeRecommendationState(recommendation: any){
    let response = await this.apiService.changeRecommendationState(this.user["user_id"], recommendation["recommendation"]["id"]).toPromise();
    if (response.id){
      this.selected_recommendation = recommendation 
      this.measurement_points_layer.clearLayers()
      let marker = L.marker([this.selected_recommendation.cell.centre.Latitude, this.selected_recommendation.cell.centre.Longitude], { icon: this.measurementPointIcon })
      this.measurement_points_layer.addLayer(marker)
    }
  }

  async openMeasurementModal(){
    //TODO: Create the selectDeviceComponent
    const modal = await this.modalCtrl.create({
      component: MeasurementComponent,
      cssClass: 'small-modal',
      backdropDismiss: false,
      componentProps: {
        campaign_id: this.campaign["campaign_id"],
        recommendation_id: this.selected_recommendation["recommendation"]["id"]
      }
    });
    modal.present();
    this.measurement_modal_is_closed = false;

    modal.onDidDismiss().then((result) => {
      this.selected_recommendation = null;
      this.measurement_modal_is_closed = true;
      this.showVoluneerAbort = false;
      this.measurement_points_layer.clearLayers()
      if (result.data.ask_user_to_continue){
        this.ask_user_to_continue_voluteering()
      }
    });
  }

  abortVoluneer(){
    this.showVoluneerAbort = false;
    this.measurement_points_layer.clearLayers()
    this.selected_recommendation = null;
  }

  goBack() {
    this.location.back()
  }

  async showAlert(title, message){
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: ["OK"],
    });

    await alert.present();
  }

  calculateDistance(end_lat, end_lng, current_lat, current_lng) {
    let distance = -1
    if (end_lat !== "" && end_lng !== "" && current_lat !== "" && current_lng !== "") {
      distance = this.helpService.computeDistanceBetween(end_lat, end_lng, current_lat, current_lng);
    }
    return distance * 1000
  }


  async ask_user_to_continue_voluteering() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('general.recommenations'),
      message: this.translateService.instant('general.do_you_want_new_recommentation'),
      buttons: [
        {
          text: this.translateService.instant('general.cancel'),
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: this.translateService.instant('general.confirm'),
          handler: () => {
            this.requestRecommendation()
          }
        }
      ]
    });
    alert.present();
  }

  ngOnDestroy() {

  }

}
