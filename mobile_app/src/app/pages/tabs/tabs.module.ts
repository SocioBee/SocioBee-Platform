import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from "@angular/router";
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TabsComponent } from './tabs.component';
import { SharedComponentsModule } from 'src/app/core/components/shared-components.module';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      { path: "dashboard", loadChildren: () => import("./dashboard/dashboard.module").then(m => m.DashboardModule) },
      { path: "campaigns", loadChildren: () => import("./campaigns/campaigns.module").then(m => m.CampaignsModule) },
      { path: "notifications", loadChildren: () => import("./notifications/notifications.module").then(m => m.NotificationsModule) },
      { path: "profile", loadChildren: () => import("./profile/profile.module").then(m => m.ProfileModule) },
      { path: "selected-campaign", loadChildren: () => import("./selected-campaign/selected-campaign.module").then(m => m.SelectedCampaignModule) },
      { path: "", redirectTo: "dashboard", pathMatch: "full" }
    ]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  }

];



@NgModule({
  declarations: [TabsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    FormsModule,
    SharedComponentsModule
  ]
})
export class TabsModule { }
