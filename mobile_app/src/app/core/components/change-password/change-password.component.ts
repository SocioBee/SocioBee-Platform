import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import * as shajs from 'sha.js';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {

  @Input() creds;
  changeForm!: FormGroup;
  isActiveToggleTextPassword1: boolean = false;
  isActiveToggleTextPassword2: boolean = false;
  isActiveToggleTextPassword3: boolean = false;
  data =  new FormGroup({
    password: new FormControl('', Validators.required),
    password_repeat: new FormControl('', Validators.required)
   });



  constructor(
    private authService : AuthService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.changeForm = this.fb.group({
      "password" : new FormControl('', [Validators.required, Validators.minLength(5)]),
      "password_repeat": new FormControl('', [Validators.required, Validators.minLength(5)]),
    });
  }




  onChangePassword() {

    if (this.changeForm.valid) {
      const formRawValue = this.changeForm.getRawValue();
      if (formRawValue.password === formRawValue.password_repeat){
        let data = {
          "new_pass": shajs('sha256').update(formRawValue.password).digest('hex'),
          "curr_pass": this.creds.password,
          "email": this.creds.email
        }
        this.authService.changePassword(data)
        .subscribe((data : any) => {
          if (data.success){
            this.showAlert(this.translateService.instant('change-password.alert-message-success'))
          }else{
            this.showAlert(data["error"])
          }
          this.modalCtrl.dismiss();
        }, err => {
          this.showAlert(this.translateService.instant('change-password.alert-message-error'))
          this.modalCtrl.dismiss();
        });
      }else{
        this.showAlert(this.translateService.instant('change-password.passwords_not_same'))
      }

    }
  }


  async showAlert(message) {
    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('change-password.title'),
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  toggleTextPassword1(): void {
    this.isActiveToggleTextPassword1 = (this.isActiveToggleTextPassword1 == true) ? false : true;
  }
  toggleTextPassword2(): void {
    this.isActiveToggleTextPassword2 = (this.isActiveToggleTextPassword2 == true) ? false : true;
  }
  toggleTextPassword3(): void {
    this.isActiveToggleTextPassword3 = (this.isActiveToggleTextPassword3 == true) ? false : true;
  }

  getType1() {
    return this.isActiveToggleTextPassword1 ? 'text' : 'password';
  }

  getType2() {
    return this.isActiveToggleTextPassword2 ? 'text' : 'password';
  }
  getType3() {
    return this.isActiveToggleTextPassword3 ? 'text' : 'password';
  }
}