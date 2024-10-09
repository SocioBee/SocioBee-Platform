import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  loading = null
  constructor(
    private http: HttpClient,
    public loadingController: LoadingController,
    public toastController: ToastController
    ) { }

  createPolyline(coords: any) {

    let final_coords = []
    for (var i = 0; i < coords.length; i++) {
      let temp_inner = [];
      for (var j = coords[i].length - 1; j >= 0; j--) {
        var tmp_linePoints = [];
        tmp_linePoints.push(coords[i][j].lat);
        tmp_linePoints.push(coords[i][j].lng);
        temp_inner.push(tmp_linePoints);
      }
      final_coords.push(temp_inner);
    }

    return final_coords
  }

  computeDistanceBetween(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  public getDateStart() {
    var date = new Date('05 October 2011 00:00 UTC');
    return date.toISOString();
 }

 public getDateEnd() {
  var date = new Date('05 October 2011 23:59 UTC');
  return date.toISOString();
}

  public checkServer() {
    return this.http.get(`${environment.serverURL}/authAPI/check`);
  }

  async presentLoading(message: string) {
    this.loading = await this.loadingController.create({
      message: message,
      spinner: 'bubbles',
      duration: 0
    });
    await this.loading.present();
  }

  dismissLoading(){
    if (this.loading){
      this.loading.dismiss()
      this.loading = null
    }
  }

  async presentToastBottom(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

}
