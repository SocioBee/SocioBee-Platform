import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "./core/guards/authentication.guard";
import { RoleGuard } from './core/guards/role.guard';
import { ShellLayoutComponent } from "./layouts/shell-layout/shell-layout.component";

const routes: Routes = [
  {
    path: "",
    children: [
      { path: "", loadChildren: () => import("./../app/pages/authenticate/authenticate.module").then(m => m.AuthenticateModule) }
    ]
  },

  {
    path: "",
    component: ShellLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "dashboard", loadChildren: () => import("./pages/dashboard/dashboard.module").then(m => m.DashboardModule) },
      { path: "campaigns", loadChildren: () => import("./pages/campaigns/campaigns.module").then(m => m.CampaignsModule) },
      { path: "hives", loadChildren: () => import("./pages/hives/hives.module").then(m => m.HivesModule) },
      { path: "explore_data", loadChildren: () => import("./pages/explore-data/explore-data.module").then(m => m.ExploreDataModule) },
      { path: "training_material", loadChildren: () => import("./pages/training-material/training-material.module").then(m => m.TrainingMaterialModule) },
      { path: "settings", loadChildren: () => import("./pages/settings/settings.module").then(m => m.SettingsModule) },
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "**", redirectTo: "/login" }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
