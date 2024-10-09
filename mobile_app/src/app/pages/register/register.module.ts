import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { RegisterComponent } from './register.component';
import { TranslateModule } from "@ngx-translate/core";
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/core/components/shared-components.module';


const routes: Routes = [
  { path: "", component: RegisterComponent}
];

@NgModule({
  declarations: [RegisterComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedComponentsModule,
    TranslateModule.forChild()
  ]
})
export class RegisterModule { }
