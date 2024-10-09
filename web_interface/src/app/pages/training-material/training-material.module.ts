import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingMaterialComponent } from './training-material.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

const routes: Routes = [ 
  {path: "", component: TrainingMaterialComponent}
];


@NgModule({
  declarations: [
    TrainingMaterialComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    CardModule,
    ButtonModule
  ]
})
export class TrainingMaterialModule { }
