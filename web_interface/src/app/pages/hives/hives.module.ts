import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HivesComponent } from './hives.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';


import { HiveItemComponent } from './hive-item/hive-item.component';

const routes: Routes = [ 
  {path: "", component: HivesComponent}
];


@NgModule({
  declarations: [
    HivesComponent,
    HiveItemComponent
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
    CardModule,
    DynamicDialogModule,
    DialogModule,
    MultiSelectModule,
    ListboxModule,
    DropdownModule,
    ProgressBarModule
  ]
})
export class HivesModule { }
