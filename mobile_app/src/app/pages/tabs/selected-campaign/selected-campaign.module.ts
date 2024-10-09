import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/core/components/shared-components.module';
import { SelectedCampaignComponent } from './selected-campaign.component';
import { TranslateModule } from '@ngx-translate/core';


const routes: Routes = [
  {
    path: "",
    component: SelectedCampaignComponent,
    children: [
      { path: ":campaign_id", component: SelectedCampaignComponent },
    ]
  }
];

@NgModule({
  declarations: [SelectedCampaignComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedComponentsModule,
    TranslateModule.forChild()
  ]
})
export class SelectedCampaignModule { }
