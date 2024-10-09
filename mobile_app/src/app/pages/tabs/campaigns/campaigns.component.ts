import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core'
import { TabsComponent } from '../tabs.component';
import { APIService } from 'src/app/core/services/api.service';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { MapViewComponent } from 'src/app/core/components/map-view/map-view.component';
import { VolunteeringCampaignsFiltersComponent } from 'src/app/core/components/volunteering-campaigns-filters/volunteering-campaigns-filters.component';

import { environment } from "../../../../environments/environment"
import { ProposedCampaignsFiltersComponent } from 'src/app/core/components/proposed-campaigns-filters/proposed-campaigns-filters.component';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss'],
})
export class CampaignsComponent implements OnInit {

  tab_name = ""
  selectedTab = "volunteering"

  user: any;
  volunteering_campaigns: any = null
  proposed_campaigns: any = null
  filter_params: any = {
    sort_by: "most_recent",
    view: "active"
  }

  constructor(
    private translateService: TranslateService,
    private apiService: APIService,
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => { this.translateService.use(event.lang); });
    this.tab_name = this.translateService.instant('tabs.campaigns')
  }

  ngOnInit() {
    console.log("CampaignsComponent - ngOnInit")
  }


  ionViewDidEnter() {
    console.log("CampaignsComponent - ionViewDidEnter")
    this.user = this.authService.getUser();
    this.getVolunteeringCampaigns(null, this.filter_params.view)
    this.getProposedCampaigns(null)
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async getVolunteeringCampaigns($event, status) {
    let data = {
      "user_id": this.user.user_id,
      "from_date": -1,
      "to_date": -1
    }
    if (status == "all"){
      data["status"] = ['published', 'active', 'completed']
    }else{
      data["status"] = [status]
    }
    this.volunteering_campaigns = await this.apiService.getUserCampaigns(data).toPromise();
    this.volunteering_campaigns.forEach((element: any) => {
      element.thumbnail = environment.serverURL + "/" + environment.apiName + "/" + element.campaign_id + "/" + element.thumbnail;
    });
    console.log("volunteering_campaigns: " + this.volunteering_campaigns)
    if ($event !== null){
      $event.target.complete();
    }
    
  }

  async openVolunteeringFilters() {
    const modal = await this.modalCtrl.create({
      component: VolunteeringCampaignsFiltersComponent,
      cssClass: 'small-modal',
      componentProps: {
        'filter_params': this.filter_params
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save') {
      this.filter_params = data
      this.getVolunteeringCampaigns(null, this.filter_params.view)
    }
  }

  async openVolunteeringMap() {
    const modal = await this.modalCtrl.create({
      component: MapViewComponent,
      cssClass: 'small-modal',
      componentProps: {
        'campaigns': this.volunteering_campaigns,
        'type': 'participating',
        'map_title': this.translateService.instant('tabs.campaigns')
      }
    });
    modal.present();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  async getProposedCampaigns($event) {
    let data = {
      "user_id": this.user.user_id,
      "from_date": -1,
      "to_date": -1,
      "status": ['proposed']
    }
    this.proposed_campaigns = await this.apiService.getUserCampaigns(data).toPromise();
    this.proposed_campaigns.forEach((element: any) => {
      element.thumbnail = environment.serverURL + "/" + environment.apiName + "/" + element.campaign_id + "/" + element.thumbnail;
    });
    console.log("proposed_campaigns: " + this.proposed_campaigns)
    if ($event !== null){
      $event.target.complete();
    }
  }


  async openProposedFilters() {
    const modal = await this.modalCtrl.create({
      component: ProposedCampaignsFiltersComponent,
      cssClass: 'small-modal',
      componentProps: {
        'filter_params': this.filter_params
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save') {
      this.filter_params =data
    }
  }


  async openProposedMap() {
    const modal = await this.modalCtrl.create({
      component: MapViewComponent,
      cssClass: 'small-modal',
      componentProps: {
        'campaigns': this.proposed_campaigns,
        'type': 'proposed',
        'map_title': this.translateService.instant('tabs.proposed')
      }
    });
    modal.present();
  }

  proposeNewCampaign(){
    console.log("Create and propose new campaign")
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ngOnDestroy() {
    
  }


}
