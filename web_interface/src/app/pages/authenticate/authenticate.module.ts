import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from "@ngx-translate/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthenticateComponent } from './authenticate.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';


const routes: Routes = [
  {
    path: "", 
    component: AuthenticateComponent,
    children: [
      { path: "login", component: LoginComponent  },
      { path: "register", component: RegisterComponent },
      { path: "", redirectTo: "login", pathMatch: "full" }
    ]
  }
];

@NgModule({
  declarations: [LoginComponent, RegisterComponent, AuthenticateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CalendarModule,
    DropdownModule
  ],
  providers: []
})
export class AuthenticateModule { }
