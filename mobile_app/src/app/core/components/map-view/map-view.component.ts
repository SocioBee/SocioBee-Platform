import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit {


  @Input() campaigns;
  @Input() type;
  @Input() map_title;

  campaigns_markers = []

  init_coords: any = [40.566380, 22.997533]
  init_zoom: number = 12
  map: L.Map;
  campaignMarker = L.icon({ iconUrl: 'assets/images/markers/campaign.png', iconSize: [30, 30] });
  markerClusterGroup = new L.MarkerClusterGroup();
  showDetails: boolean = false;

  campaign: any;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.initializeLeafletMap();
  }


  initializeLeafletMap() {
    if (this.map == undefined) {

      this.map = L.map('mapId', { maxZoom: 18 })
        .on('load', (e: any) => setTimeout(() => { this.map.invalidateSize(); }, 100))
        .on('click', (e: any) => { this.showDetails = false })
        .addLayer(this.markerClusterGroup);
        if (this.campaigns.length > 0){
          this.map.setView([this.campaigns[0].latitude, this.campaigns[0].longitude], this.init_zoom);
        }else{
          this.map.setView(this.init_coords, this.init_zoom);
        }

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

      this.populateMarkers()
    }
  }

  populateMarkers() {
    for (var i in this.campaigns) {
      let marker = L.marker([this.campaigns[i]['latitude'], this.campaigns[i]['longitude']], { icon: this.campaignMarker });
      marker.on('click', (e: any) => {
        this.openMarkerDetails(e.target)
      });

      // marker.addTo(this.campaignsLayer);
      this.markerClusterGroup.addLayer(marker)
      this.campaigns_markers = [...this.campaigns_markers, { "campaign": this.campaigns[i], "marker": marker }];
    }

  }


  openMarkerDetails(selected_marker) {
    this.campaigns_markers.forEach((element: any) => {
      if (element.marker._leaflet_id == selected_marker._leaflet_id) {
        this.showDetails = true
        this.campaign = element.campaign
      }
    })
  }

  closeMap() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  ngOnDestroy() {

  }

}