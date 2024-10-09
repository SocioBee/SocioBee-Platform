import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-proposed-campaigns-filters',
  templateUrl: './proposed-campaigns-filters.component.html',
  styleUrls: ['./proposed-campaigns-filters.component.scss'],
})
export class ProposedCampaignsFiltersComponent implements OnInit {

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