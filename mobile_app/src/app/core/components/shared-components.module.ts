import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { CampaignItemComponent } from './campaign-item/campaign-item.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { MapViewComponent } from './map-view/map-view.component';
import { ActiveCampaignsFiltersComponent } from './active-campaigns-filters/active-campaigns-filters.component';
import { VolunteeringCampaignsFiltersComponent } from './volunteering-campaigns-filters/volunteering-campaigns-filters.component';
import { ProposedCampaignsFiltersComponent } from './proposed-campaigns-filters/proposed-campaigns-filters.component';
import { MeasurementComponent } from './measurement/measurement.component';
import { NgCircleProgressModule } from 'ng-circle-progress';

@NgModule({
  declarations: [
    ToolbarComponent,
    ChangePasswordComponent,
    CampaignItemComponent,
    NotificationItemComponent,
    MapViewComponent,
    ActiveCampaignsFiltersComponent,
    VolunteeringCampaignsFiltersComponent,
    ProposedCampaignsFiltersComponent,
    MeasurementComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild(),
    ReactiveFormsModule,
    FormsModule,
    NgCircleProgressModule.forRoot({
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    })
  ],
  exports: [
    ToolbarComponent,
    CampaignItemComponent,
    NotificationItemComponent,
    MapViewComponent,
    ActiveCampaignsFiltersComponent,
    VolunteeringCampaignsFiltersComponent,
    ProposedCampaignsFiltersComponent
  ]
})
export class SharedComponentsModule { }
