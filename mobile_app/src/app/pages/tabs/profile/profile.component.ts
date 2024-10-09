import { Component, OnInit, ViewChild } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { APIService } from 'src/app/core/services/api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { HelperService } from 'src/app/core/services/helper.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { BleClient, ScanResult, hexStringToDataView, numberToUUID, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { AlertController, IonSelect, LoadingController } from '@ionic/angular';
import { LocationService } from 'src/app/core/services/location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  @ViewChild('deviceSelect', { static: false }) selectDeviceRef: IonSelect;

  tab_name = ""
  wsn: ScanResult = null;
  user: any;
  available_device_list: any = [];
  available_languages: any;
  selected_language: any;
  selected_device_name: any;

  scanTimeout = 3500;
  has_connected_device = false;

  campaign_origin = null;

  ble_config = {
    service: "2e7987f1-097b-490e-9bf3-ad2d5f15b141",
    characteristics: "16a7c1e8-cfe5-4385-bc4b-46d5c3af6e27",
    value: hexStringToDataView('00 00 05')
  }

  constructor(
    private translateService: TranslateService,
    private authService: AuthService,
    private language: LanguageService,
    private apiService: APIService,
    private helperService: HelperService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private locationService: LocationService,
    private router: Router
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => { this.translateService.use(event.lang); });
    this.tab_name = this.translateService.instant('tabs.profile')
  }

  async ngOnInit() {
    this.available_languages = this.language.getAvailableLangs();
    this.selected_language = this.language.getLangStorage();
    this.user = this.authService.getUser();
  }

  async ionViewDidEnter() {
    this.selected_language = this.language.getLangStorage();
    this.user = this.authService.getUser();
    this.available_device_list = await this.apiService.getAllDevices().toPromise();
    this.checkIfHasConnectedDevice();
    if(history.state.campaign_id){
      this.campaign_origin = history.state;
    }else{
      this.campaign_origin = null;
    }
  }

  openDeviceSelect() {
    this.selectDeviceRef.open()
  }

  handleLanguageChange($event) {
    if (this.selected_language != $event.detail.value) {
      this.language.setLangStorage($event.detail.value)
      location.reload();
    }
  }

  handleDeviceSelect($event) {
    this.connectToDevice($event.detail.value)
  }

  async checkIfHasConnectedDevice() {
    try {
      await BleClient.initialize();
      let connected_device_list = await BleClient.getConnectedDevices([]);
      console.log("connected_device_list: ", connected_device_list)

      let my_device = null;
      for (var i = 0; i < connected_device_list.length; i++) {
        for (var j = 0; j < this.available_device_list.length; j++) {
          if (connected_device_list[i]["name"] == "WSN_" + this.available_device_list[j]["name"]) {
            my_device = this.available_device_list[j]
            break;
          }
        }
      }
      if (my_device != null) {
        this.authService.setSelectedDevice(my_device)
        this.selected_device_name = my_device.name
        this.has_connected_device = true;
      } else {
        this.authService.setSelectedDevice(null)
        this.selected_device_name = null
        this.has_connected_device = false;
      }
    } catch (error) {
      console.error('scanForDevice', error);
      return null
    }

  }

  async connectToDevice(device_name) {
    if (device_name.length > 0) {
      this.helperService.presentLoading( this.translateService.instant('general.connecting_to_device') + ": " + device_name)
      try {
        await BleClient.initialize();

        await BleClient.requestLEScan({ name: "WSN_" + device_name }, (result) => { this.wsn = result });

        setTimeout(async () => {
          await BleClient.stopLEScan();
          if (this.wsn != null) {
            console.log("WSN_" + device_name + " Found")
            await BleClient.connect(this.wsn.device.deviceId, (deviceId) => this.onDeviceDisconnected(device_name));
            this.onDeviceConnected(device_name)
          } else {
            this.onDeviceNotFound(device_name)
          }

        }, this.scanTimeout);

      } catch (error) {
        console.error('Search device ERROR:', error);
        this.helperService.dismissLoading();
        return null
      }
    }


  }

  async disconnectFromDevice() {
    if (this.wsn) {
      this.helperService.presentLoading(this.translateService.instant('general.disconnecting_from_device') + ": " + this.selected_device_name)
      await BleClient.disconnect(this.wsn.device.deviceId);
    }
  }

  async onDeviceConnected(device_name) {
    
    await BleClient.write(this.wsn.device.deviceId, this.ble_config.service, this.ble_config.characteristics, this.ble_config.value)   

    console.log("WSN_" + device_name + " Connected");
    let index: number = this.available_device_list.findIndex(item => item.name === device_name);
    this.authService.setSelectedDevice(this.available_device_list[index])
    this.selected_device_name = device_name
    this.has_connected_device = true;
    this.helperService.dismissLoading();
    this.showConnectedAlert(device_name)
    // this.helperService.presentToastBottom( this.translateService.instant('general.connected_to_device') + ": " + device_name);


  }

  onDeviceDisconnected(device_name) {
    this.wsn = null;
    this.selected_device_name = null
    this.authService.setSelectedDevice(null)
    this.helperService.dismissLoading();
    if (this.has_connected_device) {
      this.helperService.presentToastBottom(this.translateService.instant('general.disconnected_from_device') + ": " + device_name);
    } else {
      this.helperService.presentToastBottom(this.translateService.instant('general.cannot_connect_to_device') + ":" + device_name);
    }
    this.has_connected_device = false;
  }

  onDeviceNotFound(device_name) {
    this.wsn = null;
    this.selected_device_name = null
    this.authService.setSelectedDevice(null)
    this.helperService.dismissLoading();
    this.has_connected_device = false;
    this.helperService.presentToastBottom(this.translateService.instant('general.could_not_find_device') + ": " + device_name);
  }


  async showConnectedAlert(device_name){
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant( this.translateService.instant('general.device') ),
      message: this.translateService.instant( this.translateService.instant('general.connected_to_device') + " " + device_name),
      buttons: [
        {
          text: this.translateService.instant('general.confirm'),
          handler: () => {
            if (this.campaign_origin != null){
              this.router.navigate(["tabs/selected-campaign/" + this.campaign_origin["campaign_id"]], {state: this.campaign_origin});
            }
          }
        }
      ]
    });
    alert.present();
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
            if(this.has_connected_device){
              this.helperService.presentToastBottom(this.translateService.instant('general.please_disconnect'));
            }else{
              this.logout()
            }
            
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



  ngOnDestroy() {

  }

}
