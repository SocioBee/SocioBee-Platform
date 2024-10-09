import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
// import 'leaflet.heat'
import 'leaflet.heat/dist/leaflet-heat.js'
import { APIService } from 'src/app/core/services/api.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { HelpersService } from 'src/app/core/services/helpers.service';


@Component({
  selector: 'app-explore-data',
  templateUrl: './explore-data.component.html',
  styleUrls: ['./explore-data.component.scss']
})
export class ExploreDataComponent implements OnInit {

  init_coords: any = []
  init_zoom: number = 12
  map!: L.Map;
  user: any;

  
  okPointIcon = L.icon({ iconUrl: 'assets/images/ok.png', iconSize: [15, 15] });
  aqiPointIcon = L.icon({ iconUrl: 'assets/images/aqi.png', iconSize: [15, 15] });

  streetsTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  satelliteTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

  measurements_layer = new L.FeatureGroup();
  heatmap_layer = new (L as any).heatLayer([], {radius: 50});
  aqi_layer = new L.FeatureGroup();
  // source_pollution_layer = new L.FeatureGroup();

  from_date: any;
  to_date: any

  measurements: any = []
  heatmap_data: any = []
  aqi_data: any = []

  constructor(
    private translateService: TranslateService,
    private apiService: APIService,
    private authService: AuthenticationService,
    private helpService: HelpersService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user = this.authService.getUser();
    let cities: any = await this.apiService.getAvailableCities().toPromise();
    const index = cities.findIndex((element: any) => element.value == this.user["city"]);
    this.init_coords = [cities[index]["lat"], cities[index]["lng"]]

    this.to_date = new Date();
    this.from_date = new Date();
    this.from_date.setDate(this.from_date.getDate() - 7);

    this.getExploreData()

    setTimeout(() => {
      this.initializeLeafletMap();
    }, 50);
  }

  initializeLeafletMap() {

    if (this.map == undefined) {

      this.map = L.map('map').setView(this.init_coords, this.init_zoom);

      this.map.on("click", (e: any) => {
        console.log(e.latlng)
      });

      this.streetsTileLayer.addTo(this.map);

      let default_label: string = this.translateService.instant('explorePage.default');
      let satellite_label: string = this.translateService.instant('explorePage.satellite');
      let baseLayers = {
        [default_label]: this.streetsTileLayer,
        [satellite_label]: this.satelliteTileLayer
      };

      let measurements_label: string = this.translateService.instant('explorePage.measurements');
      let heatmap_label: string = this.translateService.instant('explorePage.heatmap');
      let aqi_label: string = "AQI";
      let source_pollution_label: string = this.translateService.instant('explorePage.source_pollution');
      let overlays_active = {
        [measurements_label]: this.measurements_layer,
        [heatmap_label]: this.heatmap_layer,
        [aqi_label]: this.aqi_layer
        // [source_pollution_label]: this.source_pollution_layer,
      };

      L.control.layers(baseLayers, overlays_active, { position: 'topright', collapsed: false }).addTo(this.map);

      this.map.addLayer(this.measurements_layer)
      this.map.addLayer(this.heatmap_layer)
      this.map.addLayer(this.aqi_layer)
      // this.map.addLayer(this.source_pollution_layer)

    }

  }

  async getExploreData() {
    
    // Measurments Data
    let current_date = new Date()
    let from_timestamp = this.helpService.getUTCtimestamp(this.from_date, null, current_date)
    let to_timestamp = this.helpService.getUTCtimestamp(this.to_date, null, current_date)
    this.measurements = await this.apiService.getWSNAirQualityExploreData(this.user.user_id, from_timestamp, to_timestamp).toPromise();
    this.drawMeasurementPoints()
    
    // HeatMap- AQI Data
    
    let aqi_heatmap = await this.apiService.getHeatmapExploreData(from_timestamp, to_timestamp).toPromise();
    let fisrt_key = Object.keys(aqi_heatmap[0])[0]

    // HeatMap Data
    this.heatmap_data = aqi_heatmap[0][fisrt_key]["heatmap"]
    this.heatmap_data.forEach((item: any) => {
      item[2] = item[2] * 10;
    })

    this.heatmap_layer.setLatLngs(this.heatmap_data)
    console.log(this.heatmap_data)

    // AQI Data
    this.aqi_data = aqi_heatmap[0][fisrt_key]["aqi"]
    this.drawAQIPoints()
    console.log(this.aqi_data)


  }


  drawMeasurementPoints() {
    this.measurements_layer.clearLayers();
    if (this.measurements.measurements_location){
      this.measurements.measurements_location.forEach((item: any) => {
        let marker = L.marker([item.lat, item.lon], { icon: this.okPointIcon })
        marker.bindPopup(item.values.length + "");
        this.measurements_layer.addLayer(marker)
      })
    }

  }


  drawAQIPoints() {
    this.aqi_layer.clearLayers();
    if (this.aqi_data){
      this.aqi_data.forEach((item: any) => {
        let marker = L.marker([item.lat, item.lon], { icon: this.aqiPointIcon })
        marker.bindPopup(item.code  +":  " + item.aqi_val);
        this.aqi_layer.addLayer(marker)
      })
    }

  }
}
