import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserLocation } from '../models/UserLocation';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AuthService } from './auth.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SocketIO } from 'src/app/app.module';
import { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import { registerPlugin } from '@capacitor/core';
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentPosition: BehaviorSubject<any> = new BehaviorSubject(null);
  currentPosition$: Observable<number> = this.currentPosition.asObservable();
  currentLocation: any;

  updateLocationInterval: any;
  userLocationModel: UserLocation
  current_watcher_id: any;


  constructor(
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private geolocation: Geolocation,
    private authService: AuthService,
    private http: HttpClient,
    private socket_io: SocketIO
  ) { }


  getCurrentPosition(): Observable<any> {
    return this.currentPosition$;
  }

  setCurrentPosition(data: any) {
    this.currentPosition.next(data);
  }

  // getCurrentPosition(): any {
  //   return this.currentLocation;
  // }

  // setCurrentPosition(data: any) {
  //   this.currentLocation = data;
  // }

  startLocationMonitoring() {
    this.checkPermission()
  }

  checkPermission(){
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
          this.askToTurnOnGPS(); //If having permission show 'Turn On GPS' dialogue
        } else {
          this.requestGPSPermission(); //If not having permission ask for permission
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        // this.watchPositionGeolocation()
        this.watchPositionBackground()
        // this.getCurrentPositionGeolocation()
        // this.updateLocationInterval = setInterval(() => {
        //   this.getCurrentPositionGeolocation()
        // }, environment.updateLocationInterval);
      },
      error => console.log('Error requesting location permissions ' + JSON.stringify(error))
    );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              this.askToTurnOnGPS(); // call method to turn on GPS
            },
            error => {
              //Show Log if user click on 'No Thanks'
              console.log('requestPermission Error requesting location permissions ' + error)
            }
          );
      }
    });
  }

  watchPositionBackground() {
    let last_location;
    var self = this;
    BackgroundGeolocation.addWatcher(
      {
        backgroundMessage: "The SocioBee App is tracking your location",
        backgroundTitle: "SocioBee App",
        requestPermissions: true,
        distanceFilter: 0
      },
      function callback(location, error) {
        if (error) {
          if (error.code === "NOT_AUTHORIZED") {
            if (window.confirm(
              "This app needs your location, " +
              "but does not have permission.\n\n" +
              "Open settings now?"
            )) {
              BackgroundGeolocation.openSettings();
            }
          }
          return console.error(error);
        }
        last_location = {
          coords: {
            latitude: location["latitude"],
            longitude: location["longitude"]
          }
        }

        self.updateUserLocation(last_location)
        self.setCurrentPosition(last_location)
        return last_location
      }
    ).then(function after_the_watcher_has_been_added(watcher_id) {
      self.update_current_watcher_id(watcher_id)
    });
  }

  update_current_watcher_id(new_watcher_id) {
    if (this.current_watcher_id){
      BackgroundGeolocation.removeWatcher({ id: this.current_watcher_id });
    }
    
    this.current_watcher_id = new_watcher_id
  }

  remove_watcher(){
    if (this.current_watcher_id){
      BackgroundGeolocation.removeWatcher({ id: this.current_watcher_id });
    }
  }

  updateUserLocation(location) {
    // if (this.authService.getUser()["driver_id"] && this.authService.getVehicle()["vehicle_id"]) {
    //   let userLocation = {
    //     driver_id: this.authService.getUser()["driver_id"],
    //     vehicle_id: this.authService.getVehicle()["vehicle_id"],
    //     lat: location["coords"]["latitude"],
    //     lng: location["coords"]["longitude"]
    //   }

    //   // console.log("REAL", location["coords"])
    //   this.socket_io.emit('post_real_time_location', userLocation)
    //   // this.http.post<UserLocation>(`${environment.serverURL}/fleetAPI/post_real_time_location`, userLocation)
    //   //   .subscribe((data: any) => {
    //   //     if (data.result) {
    //   //       console.log("Real Time Location updated")
    //   //     } else {
    //   //       console.log("Real Time Location does NOT updated")
    //   //     }
    //   //   }, err => {
    //   //     console.log(err)
    //   //   });
    // }

  }

  watchPositionGeolocation() {
    let options = { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    let watch = this.geolocation.watchPosition(options);
    watch.subscribe((data) => {
      this.setCurrentPosition(data)
      this.updateUserLocation(data)
    });
  }

  getCurrentPositionGeolocation() {
    let options = { enableHighAccuracy: true, maximumAge: 0, timeout: Infinity }
    this.geolocation.getCurrentPosition(options).then((data) => {
      this.setCurrentPosition(data)
      this.updateUserLocation(data)
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

}
