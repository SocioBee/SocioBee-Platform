import { Component } from '@angular/core';
import { LanguageService } from './core/services/language.service';
import { LocationService } from './core/services/location.service';
import { AuthService } from './core/services/auth.service';
import { SocketIO } from './app.module';
import { FMCService } from './core/services/fmc.service';
import { App } from '@capacitor/app';
import { KeepAwake } from '@capacitor-community/keep-awake';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  constructor(
    private language: LanguageService,
    private locationService: LocationService,
    private authService: AuthService,
    private fmcService: FMCService,
    private socket_io: SocketIO
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.handleBackButton()
    this.handleAppStateChange()
    this.language.setInitialAppLanguage();
  }

  ngOnInit() {
    let user = this.authService.getUser();
    if (user["user_id"]) {
      // this.socket_io.emit('register_driver_sid', user);
      // this.fmcService.initializePushNotifications()
      this.locationService.startLocationMonitoring()
    }
    // this.keepAwake()
  }


  handleAppStateChange() {
    // App.addListener('appStateChange', data => {
    //   let user = this.authService.getUser();
    //   if (user["driver_id"]) {
    //     if (data.isActive) {
    //       this.socket_io.emit('register_driver_sid', user);
    //     }else{
    //       this.socket_io.emit('unregister_driver_sid', user);
    //     }
    //   }
    // });
  }

  handleBackButton() {
    App.addListener('backButton', data => {
      console.log('backButton:', data);
    });
  }

  public async keepAwake(): Promise<void> {
    await KeepAwake.keepAwake();
  }

  ngOnDestroy() {

  }


}
