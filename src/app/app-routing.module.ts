import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GemReportFormComponent } from './gem-report-form/gem-report-form.component';
import { GemReportListComponent } from './gem-report-list/gem-report-list.component';
import { GemReportDetailsComponent } from './gem-report-details/gem-report-details.component';
import { GemReportUpdateComponent } from './gem-report-update/gem-report-update.component';

const routes: Routes = [
  { path: '', redirectTo: '/reports', pathMatch: 'full' },
  { path: 'reports', component: GemReportListComponent },
  { path: 'reports/new', component: GemReportFormComponent },
  { path: 'reports/:id', component: GemReportDetailsComponent },
  { path: 'reports/:id/edit', component: GemReportUpdateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }