import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { APIService } from 'src/app/core/services/api.service';
import * as L from 'leaflet';
import { LocationService } from 'src/app/core/services/location.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  tab_name = ""
  init_zoom: number = 14

  current_location: any = {};

  map: L.Map;
  position_layer = new L.FeatureGroup();
  positionIcon = L.icon({ iconUrl: 'assets/images/markers/current.gif', iconSize: [35, 35] });
  initial_coords = [40.566380, 22.997533]


  gamification = {
    points: "",
    campaigns: "",
    measurements: "",
    level: "",
    progress: "0"
  }


  constructor(
    private translateService: TranslateService,
    private apiService: APIService,
    private locationService: LocationService,
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.use(event.lang);
    });
    this.tab_name = this.translateService.instant('tabs.notifications')
  }

  ngOnInit() {
    console.log("DashboardComponent - ngOnInit")
    this.initializeLeafletMap()
    this.getGamificationValues()
  }

  ionViewDidEnter() {
    console.log("DashboardComponent - ionViewDidEnter")
    this.initializeLeafletMap()
    this.getGamificationValues()
  }

  initializeLeafletMap() {
    if (this.map == undefined) {
      this.map = L.map('dashboardMap', { maxZoom: 25 })
        .on('load', (e: any) => setTimeout(() => { this.map.invalidateSize(); }, 100))
        .setView([40.566380, 22.997533], this.init_zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      this.map.addLayer(this.position_layer);
      this.updateCurrentLocationMarker();
    }
  }

  updateCurrentLocationMarker() {
    this.locationService.getCurrentPosition().subscribe((data: any) => {
      if (data != null) {
        if (data["coords"]) {
          this.position_layer.clearLayers();
          this.current_location = data["coords"]
          let marker = L.marker([this.current_location["latitude"], this.current_location["longitude"]], { icon: this.positionIcon });
          this.position_layer.addLayer(marker)
          this.map.flyTo([this.current_location["latitude"], this.current_location["longitude"]], this.map.getZoom())
        }
      }
    })
  }

  getGamificationValues(){
    this.gamification = {
      points: "3000",
      campaigns: "13",
      measurements: "49",
      level: "6",
      progress: "0.9"
    }
  }

  ngOnDestroy() {

  }

}
