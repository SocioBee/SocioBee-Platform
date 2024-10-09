import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { User } from '../../core/models/User';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import * as shajs from 'sha.js';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { ChangePasswordComponent } from 'src/app/core/components/change-password/change-password.component';
import { SocketIO } from 'src/app/app.module';
import { FMCService } from 'src/app/core/services/fmc.service';
import { LocationService } from 'src/app/core/services/location.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  tab_name = ""
  login = { email: '', password: '' };
  isActiveToggleTextPassword: boolean = false;

  constructor(
    private translateService: TranslateService,
    private authSevice: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private socket_io: SocketIO,
    private fmcService: FMCService,
    private locationService: LocationService
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.use(event.lang);
    });
    this.tab_name = this.translateService.instant('tabs.login')
  }

  ngOnInit() {}

  toggleTextPassword(): void {
    this.isActiveToggleTextPassword = (this.isActiveToggleTextPassword == true) ? false : true;
  }

  getType() {
    return this.isActiveToggleTextPassword ? 'text' : 'password';
  }

  onLogin(form: NgForm) {
    if (form.valid && this.login.email && this.login.password) {
      let creds = {
        email: this.login.email,
        password: shajs('sha256').update(this.login.password).digest('hex')
      }
      this.authSevice.login(creds)
        .subscribe((data: User) => {
          if (data.valid){
            this.authSevice.storeTokenData(data);
            this.authSevice.storeUserData(data.user);
            // this.fmcService.initializePushNotifications()
            this.locationService.startLocationMonitoring()
            setTimeout(() => { this.router.navigate(['tabs/dashboard']);}, 500);
          }   else{
            this.presentErrorLoginAlert(this.translateService.instant("general."+data.message));
          }
        }, err => {
          this.presentErrorLoginAlert(this.translateService.instant(err));
        });
    }
  }

  async presentErrorLoginAlert(message) {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('general.login_error'),
      message: message,
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  goToRegister(){
    this.router.navigate(['register'])
  }

}
