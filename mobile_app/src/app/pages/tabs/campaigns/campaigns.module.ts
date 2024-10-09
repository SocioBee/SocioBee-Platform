import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { CampaignsComponent } from './campaigns.component';
import { TranslateModule } from "@ngx-translate/core";
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/core/components/shared-components.module';

const routes: Routes = [
  { path: "", component: CampaignsComponent}
];


@NgModule({
  declarations: [CampaignsComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedComponentsModule,
    TranslateModule.forChild()
  ]
})
export class CampaignsModule { }
