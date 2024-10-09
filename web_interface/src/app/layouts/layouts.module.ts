import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { ShellLayoutComponent } from "./shell-layout/shell-layout.component";
import { RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { BadgeModule} from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    ShellLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule.forChild(),
    ButtonModule,
    BadgeModule,
    DialogModule
  ]
})
export class LayoutsModule { }
