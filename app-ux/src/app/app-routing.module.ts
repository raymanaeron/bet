import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CardViewComponent } from './card-view/card-view.component';
import { LocalDataComponent } from './local-data/local-data.component';
import { DataSyncComponent } from './data-sync/data-sync.component';

const routes: Routes = [
  { path: '', component: CardViewComponent},
  { path: 'dashboard', component: DashboardComponent },
  { path: 'datastore', component: LocalDataComponent },
  { path: 'sync', component: DataSyncComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
