import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { APIService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  tab_name = ""

  notifications = []

  constructor(
    private translateService: TranslateService,
    private apiService: APIService
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.use(event.lang);
    });
    this.tab_name = this.translateService.instant('tabs.notifications')
  }

  
  ngOnInit() {
    console.log("NotificationsComponent - ngOnInit")
    this.getNotifications()
  }


  ionViewDidEnter() {
    console.log("NotificationsComponent - ionViewDidEnter")
  }


  getNotifications(){
    this.apiService.getNotifications().subscribe((data:any) => {
      this.notifications = data
    }, err => {
      console.log(err)
    })
  }


  ngOnDestroy() {

  }

}
