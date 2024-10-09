import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-campaign-item',
  templateUrl: './campaign-item.component.html',
  styleUrls: ['./campaign-item.component.scss'],
})
export class CampaignItemComponent implements OnInit {

  @Input() campaign;
  @Input() type;

  constructor(
    private router: Router,
    private modalCtrl: ModalController
    ) { }

  ngOnInit() {

  }


  ngOnChanges(changes) {
    this.postProcessCampaign(changes.campaign.currentValue)
  }

  voteCampaign(){
    if (this.campaign["is_voted"]){
      this.campaign["is_voted"] = false;
      this.campaign["votes"] -= 1;
    }else{
      this.campaign["is_voted"] = true;
      this.campaign["votes"] += 1;
    }
  }

  postProcessCampaign(data){
    let today: any = new Date()
    let start_date: any = new Date(this.campaign.start_datetime)
    let end_date: any = new Date(this.campaign.end_datetime)
    this.campaign["duration"] = Math.ceil((end_date.getTime() - start_date.getTime()) / (1000 * 3600 * 24)) + 1;
  }

  async goToCampaign() {
    const isModalOpened = await this.modalCtrl.getTop();
    if (isModalOpened){
      this.modalCtrl.dismiss(null, 'cancel');
    }
    this.router.navigate(["tabs/selected-campaign/" + this.campaign["campaign_id"]], {state: this.campaign});
    
  }

}