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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  tab_name = ""
  register = {
    name: '',
    surname: '',
    user_name: '',
    email: '',
    city: '',
    gender: '',
    birthday: '',
    password: '',
    password_verify: ''
  };
  isActiveToggleTextPassword1: boolean = false;
  isActiveToggleTextPassword2: boolean = false;
  available_genders = [
    {
      name: "Non Binary",
      value: "NOBINARY"
    },
    {
      name: "Male",
      value: "MALE"
    },
    {
      name: "Female",
      value: "FEMALE"
    },
    {
      name: "No Answer",
      value: "NOANSER"
    }
  ]

  available_cities = [
    {
      "name": "Athens",
      "value": "Athens",
      "lat": "38.056527",
      "lng": "23.807347"
    },
    {
      "name": "Zaragoza",
      "value": "Zaragoza",
      "lat": "41.651803",
      "lng": "-0.889831"
    },
    {
      "name": "Ancona",
      "value": "Ancona",
      "lat": "43.607230",
      "lng": "13.510296"
    },
    {
      "name": "Thessaloniki",
      "value": "Thessaloniki",
      "lat": "40.555352",
      "lng": "22.996715"
    }
  ]
  constructor(
    private translateService: TranslateService,
    private authSevice: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private translate: TranslateService,
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

  ngOnInit() { }

  toggleTextPassword1(): void {
    this.isActiveToggleTextPassword1 = (this.isActiveToggleTextPassword1 == true) ? false : true;
  }

  toggleTextPassword2(): void {
    this.isActiveToggleTextPassword2 = (this.isActiveToggleTextPassword2 == true) ? false : true;
  }

  getType1() {
    return this.isActiveToggleTextPassword1 ? 'text' : 'password';
  }

  getType2() {
    return this.isActiveToggleTextPassword2 ? 'text' : 'password';
  }

  onRegister(form: NgForm) {
    if (form.valid && this.register.email && this.register.password && this.register.password_verify && this.register.password == this.register.password_verify) {
      let new_user = {
        birthday : this.register.birthday,
        city: this.register.city,
        email: this.register.email,
        gender: this.register.gender,
        name: this.register.name, 
        surname: this.register.surname,
        password: shajs('sha256').update(this.register.password).digest('hex'),
        type: "bee",
        user_name:this.register.user_name
      }
      this.authSevice.register(new_user)
        .subscribe((data: User) => {
          if (data.valid) {
            this.authSevice.storeTokenData(data);
            this.authSevice.storeUserData(data.user);
            this.fmcService.initializePushNotifications()
            this.locationService.startLocationMonitoring()
            setTimeout(() => { this.router.navigate(['tabs']); }, 500);
          } else {
            this.presentErrorLoginAlert(this.translate.instant("general." + data.message));
          }
        }, err => {
          this.presentErrorLoginAlert(this.translate.instant(err));
        });
    }
  }

  async presentErrorLoginAlert(message) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('general.register_error'),
      message: message,
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  handleGenderChange(event: any){
    this.register.gender = event.detail.value
  }
  
  handleCityChange(event: any){
    this.register.city = event.detail.value
  }
  handleBirthdayChange(event: any){
    this.register.birthday = event.detail.value.split("+")[0]
  }

  goToLogin() {
    this.router.navigate(['login'])
  }

}
