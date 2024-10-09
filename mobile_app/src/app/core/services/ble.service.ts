import { Injectable } from '@angular/core';
import { Router } from '@angular/router';



import { SocketIO } from 'src/app/app.module';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BLEService {


    constructor(
        private router: Router,
        private authService: AuthService,
        private socket_io: SocketIO
    ) {

     }




}
