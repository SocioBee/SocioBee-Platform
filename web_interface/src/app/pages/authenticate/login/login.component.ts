import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/core/services/authentication.service";
import { HelpersService } from "src/app/core/services/helpers.service";
import { AppToastService } from "src/app/core/services/toast.service";
import shajs from 'sha.js';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-login",
  styleUrls: ["./login.component.scss"],
  templateUrl: "./login.component.html",
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error = "";

  @ViewChild("passwordField", { static: false }) passwordField!: ElementRef;
  
  defaultUsername = ""
  defaultPassword = ""

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private helpers: HelpersService,
    private toastService: AppToastService,
    private translateService: TranslateService
  ) {
    if (this.authenticationService.isUserAuthenticated()) {
      this.router.navigateByUrl("/dashboard");     
      return;
    }
  }

  get formControls() {
    return this.loginForm.controls;
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(5)])]
    });
  }


  login() {
    this.helpers.markFormGroupDirty(this.loginForm);
    this.helpers.markFormGroupTouched(this.loginForm);

    if (!this.loginForm.valid) {
      return;
    }

    const model = this.loginForm.getRawValue();
    
    this.authenticationService.login({ email: model.email, password: shajs('sha256').update(model.password).digest('hex')})
      .subscribe(data => {
        if (data.valid){
          this.authenticationService.storeTokenData(data);
          this.authenticationService.storeUserData(data.user);

          this.router.navigateByUrl("/dashboard"); 
        }  else{
          this.toastService.errorMessage(this.translateService.instant("authPage."+data.message))
        }
      }, err => {
        this.toastService.errorMessage(err)
      });
  }

  togglePassword() {
    if (this.passwordField.nativeElement.type === "text") {
      this.passwordField.nativeElement.type = "password";
    } else {
      this.passwordField.nativeElement.type = "text";
    }
  }

  goToRegistration(){
    this.router.navigateByUrl("/register");
  }

}
