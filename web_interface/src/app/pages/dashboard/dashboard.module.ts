import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ListboxModule } from 'primeng/listbox';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';;
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';



const routes: Routes = [ 
  {path: "", component: DashboardComponent}
];


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ButtonModule,
    PanelModule,
    TableModule,
    ListboxModule,
    ReactiveFormsModule, 
    FormsModule,
    DialogModule,
    GooglePlaceModule,
    InputTextModule,
    ToastModule,
    ToggleButtonModule,
    CheckboxModule,
    ProgressBarModule,
    TooltipModule,
    ConfirmDialogModule,
    ChartModule,
    CardModule,
    CalendarModule,
    DropdownModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class DashboardModule { }
