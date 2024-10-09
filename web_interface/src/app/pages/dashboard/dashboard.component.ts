import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { APIService } from 'src/app/core/services/api.service';
import * as L from 'leaflet';
import { AppToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment';
import { SocketIO } from 'src/app/app.module';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';
import { UIChart } from "primeng/chart";
import { HelpersService } from 'src/app/core/services/helpers.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild("chart1") chart1: UIChart;
  @ViewChild("chart2") chart2: UIChart;

  init_coords: any = []
  init_zoom: number = 12
  map!: L.Map;
  campaign_layer = new L.FeatureGroup();

  options: any;
  user: any;
  today: any = -1
  from_date: any = -1;
  to_date: any = - 1;
  data_types: any;
  chart_types: any;
  selected_data_type_1: any = "";
  selected_chart_type_1: any = "";
  selected_data_1: any;

  selected_data_type_2: any = "";
  selected_chart_type_2: any = "";
  selected_data_2: any;

  completed_campaigns: any = {
    "avg_distance": 0,
    "avg_measurements": 0,
    "avg_participants": 0,
    "campaigns": { "datasets": [{ "data": [] }], "labels": [] },
    "measurements": { "datasets": [{ "data": [] }], "labels": [] },
    "participants": { "datasets": [{ "data": [] }], "labels": [] },
    "tot_distance": 0,
    "tot_measurements": 0,
    "total": 0
  }

  active_campaigns: any = {
    "total": 0,
    "cities": 0,
    "tot_participants": 0,
    "avg_participants": 0,
    "tot_measurements": 0,
    "avg_measurements": 0,
    "campaigns": []
  }

  constructor(
    private translateService: TranslateService,
    private apiService: APIService,
    private authService: AuthenticationService,
    private router: Router,
    private helpService: HelpersService
  ) { 
    this.today = new Date();
    this.to_date = new Date();
    this.from_date = new Date();
    this.from_date.setMonth(this.from_date.getMonth() - 1);
    
    this.user = this.authService.getUser();

    this.data_types = [
      { "name": this.translateService.instant("dashboardPage.campaigns"), "value": "campaigns" },
      { "name": this.translateService.instant("dashboardPage.participants"), "value": "participants" },
      { "name": this.translateService.instant("dashboardPage.measurements"), "value": "measurements" }
    ]

    this.chart_types = [
      { "name": this.translateService.instant("dashboardPage.bar"), "value": "bar" },
      { "name": this.translateService.instant("dashboardPage.line"), "value": "line" }
    ]

    this.selected_data_type_1 = this.data_types[0]
    this.selected_chart_type_1 = this.chart_types[0]
    this.selected_data_type_2 = this.data_types[1]
    this.selected_chart_type_2 = this.chart_types[1]
  }


  async ngOnInit(): Promise<void> {
    let cities: any = await this.apiService.getAvailableCities().toPromise();
    const index = cities.findIndex((element: any) => element.value == this.user["city"]);
    this.init_coords = [cities[index]["lat"], cities[index]["lng"]]





    this.getActiveCampaigns();
    this.getCompletedCampaigns();

    setTimeout(() => {
      this.initializeLeafletMap();
    }, 50);
  }

  async getActiveCampaigns() {
    this.active_campaigns = await this.apiService.getActiveCampaignsOverview(this.user.user_id).toPromise();
    console.log("this.active_campaigns: ", this.active_campaigns)
    this.drawCampaigns(this.active_campaigns.campaigns)

  }

  drawCampaigns(campaigns: any) {
    this.campaign_layer.clearLayers();
    for (var i = 0; i < campaigns.length; i++) {
      // Draw the campaign area on map
      const _this = this;
      const radius = campaigns[i].radius; // radius in meters
      const center = L.latLng(campaigns[i].latitude, campaigns[i].longitude);
      const circle = L.circle(center, {
        weight: 4,
        radius: radius,
        color: '#3388ff',
        opacity: 0.5,
        fillColor: '#3388ff',
        fillOpacity: 0.2
      })
      let button_style = 'background-color: #4CAF50; '+ 
                          'border: none; '+
                          'color: white; '+
                          'padding: 0.5rem 1rem; '+
                          'text-align: center; '+
                          'text-decoration: none; '+
                          'display: inline-block; '+
                          'font-size: 1rem; '+
                          'margin: 4px 2px; '+
                          'cursor: pointer;'+
                          'border-radius: 3px'

       let popup_content = "<div align='center'>" +
        "<span>" + campaigns[i].address_district + "</span><br>" +
        "<span>" + campaigns[i].city + "</span><br>"+
        "<button class='more' style='"+button_style+"'>More</button>"+
        "</div>"
        circle.bindPopup(popup_content)
        circle.on("popupopen", (a) => {
          
          var popUp = a.target.getPopup()
          popUp.getElement()
            .querySelector(".more")
            .addEventListener("click", (e: any) => {
              _this.test(a.sourceTarget._latlng.lat, a.sourceTarget._latlng.lng);
            });
        })
      this.campaign_layer.addLayer(circle);

    }

  }

  test(lat:any, lng:any){
    const index = this.active_campaigns.campaigns.findIndex((element: any) => element.latitude == lat && element.longitude == lng);
    console.log(this.active_campaigns.campaigns[index])
    // this.router.navigateByUrl("/campaigns");
    this.router.navigate(["/campaigns"], {state: this.active_campaigns.campaigns[index]});
  }

  async getCompletedCampaigns() {
    let current_date = new Date()
    let result = await this.apiService.getCompletedCampaignsOverview(this.user.user_id, this.helpService.getUTCtimestamp(this.from_date, "start", current_date), this.helpService.getUTCtimestamp(this.to_date, "end", current_date)).toPromise();
    result.campaigns.labels = this.helpService.convertUTCtoLocalDate(result.campaigns.labels, current_date)
    result.measurements.labels = this.helpService.convertUTCtoLocalDate(result.measurements.labels, current_date)
    result.participants.labels = this.helpService.convertUTCtoLocalDate(result.participants.labels, current_date)

    this.completed_campaigns = result
    console.log("this.completed_campaigns: ", this.completed_campaigns)
    this.completed_campaigns["campaigns"]["datasets"][0]["backgroundColor"] = 'rgba(54, 162, 235, 0.2)'
    this.completed_campaigns["campaigns"]["datasets"][0]["borderColor"] = 'rgba(54, 162, 235, 1)'
    this.completed_campaigns["campaigns"]["datasets"][0]["borderWidth"] = 1

    this.completed_campaigns["measurements"]["datasets"][0]["backgroundColor"] = 'rgba(54, 162, 235, 0.2)'
    this.completed_campaigns["measurements"]["datasets"][0]["borderColor"] = 'rgba(54, 162, 235, 1)'
    this.completed_campaigns["measurements"]["datasets"][0]["borderWidth"] = 1

    this.completed_campaigns["participants"]["datasets"][0]["backgroundColor"] = 'rgba(54, 162, 235, 0.2)'
    this.completed_campaigns["participants"]["datasets"][0]["borderColor"] = 'rgba(54, 162, 235, 1)'
    this.completed_campaigns["participants"]["datasets"][0]["borderWidth"] = 1

    this.selected_data_1 = this.completed_campaigns[this.selected_data_type_1["value"]]
    this.selected_data_2 = this.completed_campaigns[this.selected_data_type_2["value"]]

    this.options = {
      // responsive: false,
      // aspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  }

  onChart1Changed() {
    this.selected_data_1 = this.completed_campaigns[this.selected_data_type_1["value"]]
    setTimeout(() => {
      this.chart1.reinit();
    }, 100);
  }

  onChart2Changed() {
    this.selected_data_2 = this.completed_campaigns[this.selected_data_type_2["value"]]
    setTimeout(() => {
      this.chart2.reinit();
    }, 100);
  }

  initializeLeafletMap() {

    if (this.map == undefined) {

      this.map = L.map('map').setView(this.init_coords, this.init_zoom);

      this.map.on("click", (e: any) => {
        console.log(e.latlng)
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      this.map.addLayer(this.campaign_layer);
    }
  }





}