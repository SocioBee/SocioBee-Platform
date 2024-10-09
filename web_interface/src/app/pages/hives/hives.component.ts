import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { APIService } from 'src/app/core/services/api.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { HelpersService } from 'src/app/core/services/helpers.service';
import { HiveItemComponent } from './hive-item/hive-item.component';

@Component({
  selector: 'app-hives',
  templateUrl: './hives.component.html',
  styleUrls: ['./hives.component.scss'],
  providers: [DialogService]
})
export class HivesComponent implements OnInit {

  tableSearchKeyword: string = '';
  hives: any = []
  user: any = {};
  can_create_hive: boolean = false;

  constructor(
    private apiService: APIService,
    private dialogService: DialogService,
    private authService: AuthenticationService

  ) { }

  async ngOnInit(): Promise<void> { 
    this.user = this.authService.getUser();
    if (this.user.type == "beekeeper"){
      this.can_create_hive = true;
    }
    this.hives = await this.apiService.getUserHives(this.user.user_id).toPromise();
  }

  createHive(){
    const ref = this.dialogService.open(HiveItemComponent, {
      header: 'Create Hive',
      width: '50%',
      data: {
        hive_id: null,
        type: "create"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        this.hives.push(result)
      }
    });

  }

  openHive(hive:any){
    const ref = this.dialogService.open(HiveItemComponent, {
      header: 'Hive ID: ' + hive.hive_id,
      width: '50%',
      data: {
        hive_id: hive.hive_id,
        type: "edit"
      }
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        const found_id = this.hives.findIndex((element: any) => element.hive_id == result.hive_id);
        this.hives[found_id] = result
        this.hives = [...this.hives]
      }
    });
    
  }

  clearSearch(table: Table) {
    this.tableSearchKeyword = '';
    table.filterGlobal('', '');
    table.clear();
  }


}
