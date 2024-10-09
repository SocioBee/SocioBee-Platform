import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SocketIO } from 'src/app/app.module';
import { AuthService } from '../../services/auth.service';
import { FMCService } from '../../services/fmc.service';
import { HelperService } from '../../services/helper.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Input() tab_name: string;
  showLogOut = true;
  constructor(
    private router: Router,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private socket_io: SocketIO,
    private fmcService: FMCService,
    private helperService: HelperService,
    private locationService: LocationService,
    private loadingController: LoadingController
  ) {
    if (this.router.url == "/login") {
      this.showLogOut = false;
    }
  }

  ngOnInit() {

  }


  async triggerLogout() {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('general.logout'),
      message: this.translateService.instant('general.logout_message'),
      buttons: [
        {
          text: this.translateService.instant('general.cancel'),
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: this.translateService.instant('general.confirm'),
          handler: () => {
            this.logout()
          }
        }
      ]
    });
    alert.present();
  }


  async logout() {

    let loading = await this.loadingController.create({ message: this.translateService.instant('general.wait_log_out') });
    loading.present();
    this.authService.logout().subscribe(local_removed => {
      loading.dismiss();
      this.locationService.remove_watcher()
      this.router.navigate(['login']);
    });
  }

}
