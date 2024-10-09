import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { APIService } from 'src/app/core/services/api.service';
import { HelpersService } from 'src/app/core/services/helpers.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CampaignItemComponent } from 'src/app/pages/campaigns/campaign-item/campaign-item.component'
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { environment } from "../../../environments/environment"
import { Router } from '@angular/router';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss'],
  providers: [DialogService]
})
export class CampaignsComponent implements OnInit {

  constructor(
    private helpersService: HelpersService,
    private apiService: APIService,
    private dialogService: DialogService,
    private authService: AuthenticationService,
    private router: Router,
  ) {

  }

  user: any;
  campaigns: any = []
  tableSearchKeyword: string = '';
  status_list: any = [];
  selected_status_list: any = [];
  date_range: any;
  from_date: any = -1;
  to_date: any = -1;

  progressInterval: any = 0;
  can_create_campaign: boolean = true

  async ngOnInit(): Promise<void> {
    this.status_list = await this.helpersService.getAllStatuses().toPromise();
    this.selected_status_list = this.status_list
    this.user = this.authService.getUser();
    if (this.user.type == "beekeeper") {
      this.can_create_campaign = false;
    }
    this.getCampaigns()
    if (history.state.campaign_id){
      this.openCampaign(history.state)
    }
  }

  async getCampaigns() {
    let tmp_statuses : string[] = [];
    this.selected_status_list.forEach((element: any) => { tmp_statuses.push(element.value) });
    let data = {
      "user_id": this.user.user_id,
      "from_date": this.from_date,
      "to_date": this.to_date,
      "status": tmp_statuses
    }
    this.campaigns = await this.apiService.getUserCampaigns(data).toPromise();
    this.campaigns.forEach((element: any) => {
      element.thumbnail = environment.serverURL + "/" + environment.apiName + "/" + element.campaign_id + "/" + element.thumbnail;
    });
    this.campaigns = [...this.campaigns]
    this.calculateProgress();
    this.progressInterval = setInterval(() => { this.calculateProgress() }, 5 * 60 * 1000)
  }

  async clearSearch(table: Table) {
    this.tableSearchKeyword = '';
    table.filterGlobal('', '');
    table.clear();

    this.date_range = null;
    this.from_date = -1;
    this.to_date = -1;
    this.selected_status_list = this.status_list
    this.getCampaigns()
  }

  createCampaign() {
    const ref = this.dialogService.open(CampaignItemComponent, {
      header: 'Create Campaign',
      width: '90%',
      data: {
        campaign_id: null,
        type: "create"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        this.campaigns.push(result)
      }
    });
  }

  openCampaign(campaign: any): void {
    const ref = this.dialogService.open(CampaignItemComponent, {
      header: 'Campaign ID: ' + campaign.campaign_id,
      width: '90%',
      data: {
        campaign_id: campaign.campaign_id,
        type: "edit"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        const found_id = this.campaigns.findIndex((element: any) => element.campaign_id == result.campaign_id);
        this.campaigns[found_id] = result
        this.campaigns = [...this.campaigns]
      }
    });
  }

  calculateProgress() {
    this.campaigns.forEach(function (campaign: any) {
      const startDate = new Date(campaign.start_datetime);
      const endDate = new Date(campaign.end_datetime);
      const currDate = new Date();
      const diff_total = endDate.getTime() - startDate.getTime();
      const diff_now = currDate.getTime() - startDate.getTime();
      if (diff_now > 0) {
        campaign.progress = Math.round(diff_now * 100 / diff_total) > 100 ? 100 : Math.round(diff_now * 100 / diff_total)
      } else {
        campaign.progress = 0
      }
    })
  }

  async runFilters() {
    
    if (this.date_range) {
      if (this.date_range[0] && this.date_range[1]) {
        this.from_date = this.date_range[0].getTime()
        this.to_date = this.date_range[1].getTime()
        this.getCampaigns()
      }
    }
    
  }
}
