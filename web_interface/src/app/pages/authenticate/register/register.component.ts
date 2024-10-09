import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/core/services/authentication.service";
import { HelpersService } from "src/app/core/services/helpers.service";
import { AppToastService } from "src/app/core/services/toast.service";
import shajs from 'sha.js';
import { TranslateService } from "@ngx-translate/core";
import { APIService } from "src/app/core/services/api.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"]
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  error = "";
  loading_register: boolean = false;
  maxDate = new Date()
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

  available_cities = []

  @ViewChild("passwordFieldRegister", { static: false }) passwordFieldRegister!: ElementRef;
  @ViewChild("passwordFieldRegisterVerification", { static: false }) passwordFieldRegisterVerification!: ElementRef;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private helpers: HelpersService,
    private toastService: AppToastService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private apiService: APIService,
  ) {

    // this.maxDate.setFullYear( this.maxDate.getFullYear() - 30 );
  }

  async ngOnInit() {
    this.available_cities = await this.apiService.getAvailableCities().toPromise();
    this.createForm();
  }

  get formControls() {
    return this.registerForm.controls;
  }

  createForm() {
    let birthday = new Date()
    birthday.setFullYear( birthday.getFullYear() - 30 );
    birthday.setMonth(birthday.getMonth() - 2 )
    this.registerForm = this.fb.group({
      name: ['', Validators.compose([Validators.required])],
      surname: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      username: ['', Validators.compose([Validators.required])],
      birthday: [birthday, Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.required])],
      city: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      password_verify: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
    });
  }

  isValid(key: any) {
    if (key == "email") {
      return this.registerForm.controls['email'].invalid && this.registerForm.controls['email'].dirty && this.registerForm.controls['email'].value.includes('@') && this.registerForm.controls['email'].value.includes('.');
    }
  }

  arePasswordEqual() {
    return this.registerForm.controls["password"].value == this.registerForm.controls["password_verify"].value;
  }

  register() {
    this.helpers.markFormGroupDirty(this.registerForm);
    this.helpers.markFormGroupTouched(this.registerForm);

    if (!this.registerForm.valid) {
      return;
    }
    const model = this.registerForm.getRawValue();
    if (model.password == model.password_verify) {
      const tmp_birthday = model.birthday.toISOString().split(".");
      let new_user = {
        name: model.name,
        surname: model.surname,
        user_name: model.username,
        email: model.email,
        city: model.city,
        gender: model.gender,
        birthday: tmp_birthday[0],
        password: shajs('sha256').update(model.password).digest('hex'),
        type: "bee"

      }

      this.loading_register = true;
      this.authenticationService.register(new_user)
        .subscribe(data => {
          if (data.valid) {

            this.authenticationService.storeTokenData(data);
            this.authenticationService.storeUserData(data.user);

            this.loading_register = false;
            this.router.navigateByUrl("/dashboard");
          } else {

            this.loading_register = false;
            this.toastService.errorMessage(this.translateService.instant("authPage." + data.message))
          }
        }, err => {
          this.toastService.errorMessage(err);
          this.loading_register = false;
        });
    }
  }


  togglePassword() {
    if (this.passwordFieldRegister.nativeElement.type === "text") {
      this.passwordFieldRegister.nativeElement.type = "password";
    } else {
      this.passwordFieldRegister.nativeElement.type = "text";
    }
  }

  togglePasswordVerification() {
    if (this.passwordFieldRegisterVerification.nativeElement.type === "text") {
      this.passwordFieldRegisterVerification.nativeElement.type = "password";
    } else {
      this.passwordFieldRegisterVerification.nativeElement.type = "text";
    }
  }

  goToLogin() {
    this.router.navigateByUrl("/login");
  }



}
