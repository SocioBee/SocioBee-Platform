import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-volunteering-campaigns-filters',
  templateUrl: './volunteering-campaigns-filters.component.html',
  styleUrls: ['./volunteering-campaigns-filters.component.scss'],
})
export class VolunteeringCampaignsFiltersComponent implements OnInit {

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