import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';

import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';

import {HttpClientModule} from '@angular/common/http';

import { CampaignsComponent } from './campaigns.component';
import { CampaignItemComponent } from './campaign-item/campaign-item.component';



const routes: Routes = [ 
  {path: "", component: CampaignsComponent}
];


@NgModule({
  declarations: [
    CampaignsComponent,
    CampaignItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    TableModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    ProgressBarModule,
    DialogModule,
    InputNumberModule,
    FileUploadModule,
    HttpClientModule,
    DynamicDialogModule,
    CardModule,
    ChartModule,
    ListboxModule,
    MultiSelectModule
  ]
})
export class CampaignsModule { }
