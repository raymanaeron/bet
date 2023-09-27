import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardViewComponent } from './card-view/card-view.component';
import { DataSyncComponent } from './data-sync/data-sync.component';

const routes: Routes = [
  { path: '', component: CardViewComponent},
  { path: 'sync', component: DataSyncComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
