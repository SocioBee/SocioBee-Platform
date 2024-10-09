import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-active-campaigns-filters',
  templateUrl: './active-campaigns-filters.component.html',
  styleUrls: ['./active-campaigns-filters.component.scss'],
})
export class ActiveCampaignsFiltersComponent implements OnInit {

  @Input() filter_params;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  cancelFilters(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  saveFilters(){
    return this.modalCtrl.dismiss(this.filter_params, 'save');
  }

  ngOnDestroy() {

  }

}