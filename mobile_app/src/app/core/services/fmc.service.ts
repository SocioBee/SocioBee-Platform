import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { SocketIO } from 'src/app/app.module';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class FMCService {


    constructor(
        private router: Router,
        private authService: AuthService,
        private socket_io: SocketIO
    ) { }


    initializePushNotifications() {
        PushNotifications.requestPermissions().then(result => {
            // console.log(JSON.stringify(result))
            if (result.receive === 'granted') {
                // Register with Apple / Google to receive push via APNS/FCM
                PushNotifications.register();
            } else {
                // Show some error
            }
        });

        PushNotifications.addListener('registration', (token: Token) => {
            // console.log('Push registration success, token: ' + token.value);
            let user = this.authService.getUser();
            if (user["driver_id"]) {
                this.socket_io.emit('register_driver_fcm_token', { "driver_id": user["driver_id"] , "fcm_token": token.value});
            }
        });

        PushNotifications.addListener('registrationError', (error: any) => {
            console.log('Error on registration: ' + JSON.stringify(error));
        });

        // PushNotifications.addListener(
        //   'pushNotificationReceived',
        //   (notification: PushNotificationSchema) => {
        //     console.log('Push received: ' + JSON.stringify(notification));
        //     this.router.navigate(['tabs','chat']);
        //   },
        // );


        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            (action: ActionPerformed) => {
                // console.log('Push action performed: ' + JSON.stringify(action));
                if (action.notification.data["type"] == "mission") {
                    this.router.navigate(['tabs', 'map']);
                } else if (action.notification.data["type"] == "message") {
                    this.router.navigate(['tabs', 'chat']);
                }

            },
        );
    }

}
