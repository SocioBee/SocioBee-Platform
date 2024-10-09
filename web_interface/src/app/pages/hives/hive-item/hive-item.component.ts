import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { APIService } from 'src/app/core/services/api.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { AppToastService } from 'src/app/core/services/toast.service';
import { environment } from "../../../../environments/environment"

@Component({
  selector: 'app-hive-item',
  templateUrl: './hive-item.component.html',
  styleUrls: ['./hive-item.component.scss']
})
export class HiveItemComponent implements OnInit {

  user: any = {};
  available_bees: any = [];
  campaigns: any = []
  hive: any = {
    name: null,
    location: null,
    description: null,
    created_by: null,
    status: null,
    queen_bee: null,
    worker_bees: []
  }

  all_status: any = ["active", "inactive"]

  progressInterval: any = 0;
  can_edit_hive: boolean = false;
  can_edit_qb: boolean = true;

  loading_save_hive:boolean = false;

  available_cities = []

  constructor(
    private apiService: APIService,
    private dialogRef: DynamicDialogRef,
    private dialogConfig: DynamicDialogConfig,
    private authService: AuthenticationService,
    private toastService: AppToastService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.user = this.authService.getUser();
    this.available_cities = await this.apiService.getAvailableCities().toPromise();
    this.available_bees = await this.apiService.getAvailableBees().toPromise();
    if (this.dialogConfig.data.type == "create") {
      this.can_edit_hive = true
      this.can_edit_qb = true;
      this.hive.created_by = this.user.user_id;
      this.hive.status = this.all_status[0]
    } else if (this.dialogConfig.data.type == "edit") {
      this.hive = await this.apiService.getHive(this.dialogConfig.data.hive_id).toPromise();
      this.can_edit_hive = this.hive.created_by == this.user.user_id ? true : false;
      this.can_edit_qb = false;
      this.getHiveCampaigns();
    }
  }

  async getHiveCampaigns() {
    this.campaigns = await this.apiService.getHiveCampaigns(this.dialogConfig.data.hive_id).toPromise();
    this.campaigns.forEach((element: any) => { element.thumbnail = environment.serverURL + "/" + environment.apiName + "/" + element.campaign_id + "/" + element.thumbnail; });
    this.calculateProgress();
    this.progressInterval = setInterval(() => { this.calculateProgress() }, 5 * 60 * 1000)
    this.campaigns = [...this.campaigns]
  }

  checkIfCanBeWorker() {
    this.hive.worker_bees.forEach((element: any, index: any, object: any) => {
      if (element.user_id == this.hive.queen_bee.user_id) {
        object.splice(index, 1);
        this.toastService.errorMessage("You cannot select this bee because it is the Queen Bee")
      }
    });
  }

  checkIfCanBeQueen() {
    this.hive.worker_bees.forEach((element: any, index: any, object: any) => {
      if (element.user_id == this.hive.queen_bee.user_id) {
        this.hive.queen_bee = {}
        this.toastService.errorMessage("You cannot select this bee because it is one of the Worker Bees")
      }
    });
  }

  cancelHive() {
    this.dialogRef.close();
  }

  async saveHive() {
    
    let temp_hive = JSON.parse(JSON.stringify(this.hive));
    if (this.checkHiveData(temp_hive)) {
      this.loading_save_hive = true;
      if (temp_hive.hive_id) {
        temp_hive = await this.apiService.updateHive(temp_hive).toPromise();
      } else {
        temp_hive = await this.apiService.createHive(temp_hive).toPromise();
      }
      this.loading_save_hive = false;
      this.dialogRef.close(temp_hive);
    }
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

  checkHiveData(tmp_hive: any) {
    if (tmp_hive.name == null) {
      this.toastService.errorMessage("Please fill in the Name of the Hive")
      return false
    }
    if (tmp_hive.location == null) {
      this.toastService.errorMessage("Please fill in the Location of the Hive")
      return false
    }
    if (tmp_hive.description == null) {
      this.toastService.errorMessage("Please fill in the Description of the Hive")
      return false
    }
    if (tmp_hive.queen_bee == null) {
      this.toastService.errorMessage("Please select the Queen Bee of this Hive")
      return false
    }

    if (tmp_hive.worker_bees.length == 0) {
      this.toastService.errorMessage("Please select at least one Worker Bee for this Hive")
      return false
    }
    return true
  }

}
