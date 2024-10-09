import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { APIService } from '../../services/api.service';
import { BleClient, ScanResult, numberToUUID } from '@capacitor-community/bluetooth-le';
import { LocationService } from '../../services/location.service';
import { HelperService } from '../../services/helper.service';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-measurement',
  templateUrl: './measurement.component.html',
  styleUrls: ['./measurement.component.scss'],
})
export class MeasurementComponent implements OnInit {

  @Input() campaign_id;
  @Input() recommendation_id;
  user: any;

  selected_device: any = null;
  
  complete_percentage = 0;

  readIntervalTime = 5000;
  readInterval = null;
  remaining_time = 60
  current_location: any = null;

  ble = {
    battery: {
      service: numberToUUID(0x180f),
      characteristics: {
        soc: numberToUUID(0x2a19)
      }
    },
    envirinmental: {
      service: numberToUUID(0x181a),
      characteristics: {
        temp: numberToUUID(0x2a6e),
        rh: numberToUUID(0x2a6f),
        pm2_5: numberToUUID(0x2bd6)
      }
    },
    custom: {
      service: "33e7a34a-2c3c-4478-b477-e5d310d4f7e9",
      characteristics: {
        no2: "587680c9-3a40-4439-ae6e-b44f1e2d142f",
        o3: "9f278e7a-7b9c-4475-bb3d-06974895c4cf"
      }
    }
  }


  close_modal_pressed = false;
  measurement_collected = false;
  data_collection_running = false;
  constructor(
    private apiService: APIService,
    private locationService: LocationService,
    private helperService: HelperService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.user = this.authService.getUser();
    this.selected_device = this.authService.getSelectedDevice();
    this.getCurrentLocation()
  }

  async startDataCollection() {
    this.data_collection_running = true;
    let resp = await this.apiService.assignDevice(this.user["user_id"], this.selected_device.name, this.campaign_id).toPromise();
    if (resp.detail) {
      console.log(resp.detail)
      this.data_collection_running = false;
    } else {
      console.log("MVE informed about user-device assignment")
      await this.collectData();
      this.startCountdown()
      this.readInterval = setInterval(async () => {
        await this.collectData();
      }, this.readIntervalTime);
    
    }
  }

  startCountdown() {
    
    let percentage_to_add = 100 / this.remaining_time
    let timer = setInterval(async () => {
      if (this.remaining_time > 0) {
        this.complete_percentage = this.complete_percentage + percentage_to_add
        this.remaining_time = this.remaining_time - 1

      } else {
        clearInterval(timer)
        if (this.readInterval) { clearInterval(this.readInterval) }
        this.measurement_collected = true;
        this.data_collection_running = false;
        console.log("Data Collection Completed")

        this.modalCtrl.dismiss({ask_user_to_continue: this.measurement_collected})
      }
    }, 1000);
  }

  async collectData() {
    let measurements = await this.readDeviceMeasurements();
    console.log(measurements)
    this.sendMeasurments(measurements);
  }

  async readDeviceMeasurements() {
    const battery = await BleClient.read(this.selected_device.mac, this.ble.battery.service, this.ble.battery.characteristics.soc);
    const temperature = await BleClient.read(this.selected_device.mac, this.ble.envirinmental.service, this.ble.envirinmental.characteristics.temp);
    const humidity = await BleClient.read(this.selected_device.mac, this.ble.envirinmental.service, this.ble.envirinmental.characteristics.rh);
    const pm25 = await BleClient.read(this.selected_device.mac, this.ble.envirinmental.service, this.ble.envirinmental.characteristics.pm2_5);
    const no2 = await BleClient.read(this.selected_device.mac, this.ble.custom.service, this.ble.custom.characteristics.no2);
    const o3 = await BleClient.read(this.selected_device.mac, this.ble.custom.service, this.ble.custom.characteristics.o3);
    const epoch = Math.round(new Date().getTime() / 1000)
    console.log('--------------------------------')
    console.log('Epoch: ' + epoch)
    console.log('Battery: ' + battery.getUint8(0) + "%");
    console.log('Temperature: ' + temperature.getInt16(0, true) / 100 + "°C");
    console.log('Humidity: ' + humidity.getUint16(0, true) / 100 + "%");
    console.log('PM 2.5: ' + pm25.getFloat32(0, true) + "ug/m3");
    console.log('NO2_AE: ' + no2.getInt32(0, true) / 1000000 + "mV");
    console.log('NO2_WE: ' + no2.getInt32(4, true) / 1000000 + "mV");
    console.log('O3_AE: ' + o3.getInt32(0, true) / 1000000 + "mV");
    console.log('O3_WE: ' + o3.getInt32(4, true) / 1000000 + "mV");

    let measurements = {
      "id": "BETWSN_" + this.selected_device.name,
      "epoch": epoch,
      "afe_01": {
        "we": o3.getInt32(4, true) / 1000000,
        "ae": o3.getInt32(0, true) / 1000000,
        "v_center": 5000
      },
      "afe_02": {
        "we": no2.getInt32(4, true) / 1000000,
        "ae": no2.getInt32(0, true) / 1000000,
        "v_center": 5000
      },
      "afe_samples": 0,
      "temp": temperature.getInt16(0, true) / 100,
      "rh": humidity.getUint16(0, true) / 100,
      "sht40_samples": 0,
      "pm2_5": pm25.getFloat32(0, true),
      "pm_samples": 0,
      "battery": {
        "voltage": 5000,
        "soc": battery.getUint8(0),
        "samples": 0
      },
      "location": {
        "lat": this.current_location.latitude,
        "lon": this.current_location.longitude
      }
    }
    return measurements
  }

  async sendMeasurments(data: any) {
    let resp = await this.apiService.sendMeasurement(this.user["user_id"], this.recommendation_id, this.campaign_id, data).toPromise();
    console.log(resp)
  }

  getCurrentLocation() {
    this.locationService.getCurrentPosition().subscribe((data: any) => {
      if (data != null) {
        if (data["coords"]) {
          this.current_location = data["coords"]
          // console.log(this.current_location)
        }
      }
    })
  }

  async showAlert(message) {
    const alert = await this.alertCtrl.create({
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  closeMeasurementModal() {
    if (this.readInterval) { clearInterval(this.readInterval) }
    this.modalCtrl.dismiss({ ask_user_to_continue: this.measurement_collected });

  }

}