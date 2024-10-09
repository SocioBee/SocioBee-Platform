import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreDataComponent } from './explore-data.component';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

const routes: Routes = [ 
  {path: "", component: ExploreDataComponent}
];

@NgModule({
  declarations: [
    ExploreDataComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    CalendarModule,
    FormsModule,
    CardModule,
  ]
})
export class ExploreDataModule { }
