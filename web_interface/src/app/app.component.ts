import { Component, OnInit } from '@angular/core';
import { SocketIO } from './app.module';
import { AuthenticationService } from "./core/services/authentication.service";
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Fleet Management';

  constructor(
    private authService: AuthenticationService,
    private socket_io: SocketIO,
    private language: LanguageService
  ) {
  }

  ngOnInit() {
    
    this.language.setInitialAppLanguage();
    let user = this.authService.getUser();
    this.socket_io.emit('test_socket_message', user);
  }

}


